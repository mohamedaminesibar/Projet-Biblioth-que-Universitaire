import { db } from '../db/database';
import { Book, DelaySeverity } from '../../types/library';

export interface VerifiedRecommendation {
  book: Book;
  explanation: string;
  source: 'ai_grounded' | 'heuristic_fallback';
}

export class AiService {
  private readonly MODEL_NAME = 'gemini-3.8-flash';
  private readonly TIMEOUT_MS = 6000;

  private async getClient() {
    if (!process.env.GEMINI_API_KEY) return null;
    try {
      const genai = await import('@google/genai');
      return {
        ai: new genai.GoogleGenAI(),
        Type: genai.Type,
      };
    } catch (e) {
      console.warn('[AiService] Initialization warning:', e);
      return null;
    }
  }

  /**
   * Generates grounded book recommendations.
   * STRICT INTEGRITY RULE: The LLM is provided only with real catalog items.
   * Any returned book ID is strictly validated against db.books; hallucinated IDs are eliminated.
   */
  async getGroundedRecommendations(params: {
    currentBookId: string;
    studentId?: string;
  }): Promise<VerifiedRecommendation[]> {
    const currentBook = db.books.get(params.currentBookId);
    if (!currentBook) {
      return [];
    }

    // Retrieve previous student searches in privacy-safe manner
    const studentHistory = params.studentId
      ? (db.searchHistory.get(params.studentId) || []).map((h) => h.query).slice(0, 3)
      : [];

    // Candidate books from the real catalog (excluding current book)
    const catalogCandidates = Array.from(db.books.values())
      .filter((b) => b.id !== currentBook.id)
      .map((b) => ({
        id: b.id,
        title: b.title,
        category: b.category,
        tags: b.tags,
        available: b.availableCopies > 0,
      }));

    // If Gemini API is available and configured, attempt structured grounded generation
    const client = await this.getClient();
    if (client) {
      try {
        const prompt = `Tu es le moteur de recommandation bibliographique de la bibliothèque universitaire de l'EST (École Supérieure de Technologie).
Un étudiant consulte l'ouvrage suivant :
- Titre : "${currentBook.title}" (Discipline: ${currentBook.category}, Tags: ${currentBook.tags.join(', ')})
${studentHistory.length > 0 ? `- Recherches récentes de l'étudiant : ${studentHistory.join(', ')}` : ''}

Voici la LISTE EXHAUSTIVE ET FERMÉE des ouvrages existants dans le catalogue de l'EST :
${JSON.stringify(catalogCandidates, null, 2)}

INSTRUCTIONS STRICTES :
1. Tu dois choisir entre 1 et 3 ouvrages UNIQUEMENT parmi la liste JSON fournie ci-dessus.
2. INTERDICTION ABSOLUE d'inventer des livres, des identifiants ou des auteurs.
3. Rends uniquement un tableau JSON contenant des objets avec:
   - "bookId" : l'identifiant exact présent dans la liste
   - "explanation" : 1 phrase courte et sobre expliquant la pertinence académique pour un étudiant de l'EST.`;

        // Execution with Timeout to guarantee SLA and protect against provider hanging
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('LLM_PROVIDER_TIMEOUT')), this.TIMEOUT_MS)
        );

        const apiPromise = client.ai.models.generateContent({
          model: this.MODEL_NAME,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: client.Type.ARRAY,
              items: {
                type: client.Type.OBJECT,
                properties: {
                  bookId: { type: client.Type.STRING },
                  explanation: { type: client.Type.STRING },
                },
                required: ['bookId', 'explanation'],
              },
            },
          },
        });

        const response: any = await Promise.race([apiPromise, timeoutPromise]);
        const text = response.text || '[]';
        const parsed: Array<{ bookId: string; explanation: string }> = JSON.parse(text);

        // VALIDATION GATE: Filter only IDs that actually exist in the database
        const verifiedRecommendations: VerifiedRecommendation[] = [];
        for (const item of parsed) {
          const verifiedBook = db.books.get(item.bookId);
          // Discard hallucinated IDs or self-recommendation
          if (verifiedBook && verifiedBook.id !== currentBook.id) {
            verifiedRecommendations.push({
              book: verifiedBook,
              explanation: item.explanation || `Recommandé en complément de ${currentBook.title}.`,
              source: 'ai_grounded',
            });
          } else {
            console.warn(`[AiService] Rejected hallucinated or invalid bookId: ${item.bookId}`);
          }
        }

        if (verifiedRecommendations.length > 0) {
          return verifiedRecommendations;
        }
      } catch (err) {
        console.warn('[AiService] LLM provider error or timeout, applying deterministic fallback:', err);
      }
    }

    // DETERMINISTIC HEURISTIC FALLBACK (Zero downtime guarantee)
    return this.getHeuristicFallback(currentBook);
  }

  /**
   * Deterministic fallback when provider is unavailable
   */
  private getHeuristicFallback(currentBook: Book): VerifiedRecommendation[] {
    const similarBooks = Array.from(db.books.values())
      .filter((b) => b.id !== currentBook.id && currentBook.similarBookIds.includes(b.id))
      .slice(0, 3);

    return similarBooks.map((b) => ({
      book: b,
      explanation: `Ouvrage du même module d'enseignement (${b.category}) recommandé par le programme pédagogique de l'EST.`,
      source: 'heuristic_fallback',
    }));
  }

  /**
   * Generates a tailored notification message adapting to delay severity
   */
  async draftGradedNotification(params: {
    studentName: string;
    studentFiliere?: string;
    bookTitle: string;
    daysOverdue: number;
    severity: DelaySeverity;
  }): Promise<{ subject: string; message: string; generatedBy: 'ai' | 'template' }> {
    const { studentName, studentFiliere, bookTitle, daysOverdue, severity } = params;

    // Use Gemini for contextual phrasing if available
    const client = await this.getClient();
    if (client) {
      try {
        const prompt = `Rédige l'objet et le corps d'une notification de bibliothèque pour l'étudiant "${studentName}" (${studentFiliere || 'EST'}) qui a un retard de ${daysOverdue} jours sur le livre "${bookTitle}".
Le niveau de sévérité réglementaire est: ${severity.toUpperCase()} (yellow = rappel courtois; orange = avertissement et suspension temporaire; red = mise en demeure critique).
Format JSON strict: {"subject": string, "message": string}. En français, style institutionnel universitaire sobre.`;

        const response = await client.ai.models.generateContent({
          model: this.MODEL_NAME,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.subject && parsed.message) {
          return {
            subject: parsed.subject,
            message: parsed.message,
            generatedBy: 'ai',
          };
        }
      } catch (err) {
        console.warn('[AiService] Gemini draft error, using deterministic template:', err);
      }
    }

    // Deterministic university templates
    if (severity === 'yellow') {
      return {
        subject: `Rappel amical : Retour d'ouvrage attendu - Bibliothèque EST`,
        message: `Bonjour ${studentName},\n\nLa date d'échéance de retour pour l'ouvrage « ${bookTitle} » est dépassée de ${daysOverdue} jours.\n\nMerci de bien vouloir rapporter ce manuel à la médiathèque dès que possible ou de vous présenter à l'accueil pour régulariser votre situation.\n\nBien cordialement,\nLa Médiathèque de l'EST Fès.`,
        generatedBy: 'template',
      };
    }

    if (severity === 'orange') {
      return {
        subject: `Deuxième avertissement : Retard sur l'ouvrage « ${bookTitle} »`,
        message: `Bonjour ${studentName},\n\nL'ouvrage « ${bookTitle} » accuse actuellement un retard de ${daysOverdue} jours.\n\nNous vous rappelons que d'autres étudiants de votre promotion peuvent avoir besoin de ce document. Conformément au règlement intérieur, vos droits d'emprunt sont suspendus jusqu'à la restitution complète.\n\nMerci de vous présenter sous 48 heures.\n\nLa Direction de la Médiathèque EST.`,
        generatedBy: 'template',
      };
    }

    return {
      subject: `URGENT - Retard critique et suspension des services bibliothèque - EST`,
      message: `Bonjour ${studentName},\n\nMalgré nos précédents rappels, l'ouvrage « ${bookTitle} » n'a toujours pas été retourné (retard de ${daysOverdue} jours).\n\nVotre compte bibliothèque est définitivement suspendu et votre dossier fait l'objet d'un signalement auprès de l'administration pédagogique de votre filière (${studentFiliere || 'EST'}).\n\nVous êtes mis en demeure de restituer cet ouvrage sous 24 heures.\n\nLe Conservateur de la Médiathèque EST Fès.`,
      generatedBy: 'template',
    };
  }
}

export const aiService = new AiService();
