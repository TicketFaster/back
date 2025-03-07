"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFService = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
const logger_utility_1 = require("../utils/logger-utility");
class PDFService {
    constructor() {
        this.tempDir = path_1.default.join(process.cwd(), 'temp');
        this.ensureTempDirectory();
    }
    /**
     * S'assure que le répertoire temporaire existe
     */
    async ensureTempDirectory() {
        try {
            await fs_1.promises.mkdir(this.tempDir, { recursive: true });
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la création du répertoire temporaire: ${error}`);
        }
    }
    /**
     * Génère un fichier PDF pour un billet
     */
    async generateBilletPDF(billet) {
        try {
            if (!billet || !billet.seance || !billet.seance.evenement || !billet.reservation || !billet.reservation.client) {
                throw new Error('Données de billet incomplètes');
            }
            const filename = `billet_${billet.id}_${Date.now()}.pdf`;
            const filePath = path_1.default.join(this.tempDir, filename);
            // Générer le QR code
            const qrCodePath = path_1.default.join(this.tempDir, `qrcode_${billet.id}_${Date.now()}.png`);
            await this.generateQRCode(billet.code_barre, qrCodePath);
            // Créer le PDF
            const doc = new pdfkit_1.default({
                size: 'A4',
                margin: 50,
                info: {
                    Title: `Billet - ${billet.seance.evenement.titre}`,
                    Author: 'Billetterie'
                }
            });
            const writeStream = fs_1.promises.createWriteStream(filePath);
            doc.pipe(writeStream);
            // En-tête
            doc.fontSize(25).font('Helvetica-Bold').text('BILLET', { align: 'center' });
            doc.moveDown();
            // Logo (si disponible)
            // doc.image('path/to/logo.png', { width: 100, align: 'center' });
            // doc.moveDown();
            // Informations de l'événement
            doc.fontSize(18).font('Helvetica-Bold').text(billet.seance.evenement.titre);
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica').text(`Catégorie: ${billet.seance.evenement.categorie}`);
            doc.fontSize(12).text(`Durée: ${billet.seance.evenement.duree}`);
            doc.moveDown();
            // Détails de la séance
            doc.fontSize(14).font('Helvetica-Bold').text('Détails de la séance');
            doc.fontSize(12).font('Helvetica').text(`Date et heure: ${this.formatDate(billet.seance.date_heure)}`);
            doc.fontSize(12).text(`Salle: ${billet.seance.salle ? billet.seance.salle.nom : 'N/A'}`);
            doc.moveDown();
            // Informations du client
            doc.fontSize(14).font('Helvetica-Bold').text('Informations du client');
            doc.fontSize(12).font('Helvetica').text(`Nom: ${billet.reservation.client.nom} ${billet.reservation.client.prenom}`);
            doc.fontSize(12).text(`Email: ${billet.reservation.client.email}`);
            doc.moveDown();
            // Détails du billet
            doc.fontSize(14).font('Helvetica-Bold').text('Détails du billet');
            doc.fontSize(12).font('Helvetica').text(`Numéro de billet: ${billet.id}`);
            doc.fontSize(12).text(`Type de tarif: ${billet.type_tarif}`);
            doc.fontSize(12).text(`Prix: ${billet.prix_final.toFixed(2)} €`);
            doc.fontSize(12).text(`Statut: ${billet.statut}`);
            doc.moveDown();
            // QR Code
            doc.fontSize(14).font('Helvetica-Bold').text('Code d\'accès', { align: 'center' });
            doc.moveDown(0.5);
            try {
                const qrCodeBuffer = await fs_1.promises.readFile(qrCodePath);
                doc.image(qrCodeBuffer, { width: 200, align: 'center' });
            }
            catch (qrError) {
                logger_utility_1.logger.error(`Erreur lors de l'insertion du QR code: ${qrError}`);
                doc.fontSize(10).font('Helvetica').text(`Code-barre: ${billet.code_barre}`, { align: 'center' });
            }
            doc.moveDown();
            doc.fontSize(10).font('Helvetica').text(`Code: ${billet.code_barre}`, { align: 'center' });
            doc.moveDown(2);
            // Conditions générales
            doc.fontSize(8).font('Helvetica').text('CONDITIONS GÉNÉRALES', { align: 'center' });
            doc.fontSize(8).text(`Ce billet est personnel et non remboursable. Il doit être présenté à l'entrée de la salle.`, { align: 'center' });
            doc.fontSize(8).text(`Veuillez vous présenter 30 minutes avant le début de la séance.`, { align: 'center' });
            // Pied de page
            doc.fontSize(8).text(`Généré le ${new Date().toLocaleString()}`, { align: 'center' });
            // Finaliser le document
            doc.end();
            // Attendre que l'écriture du fichier soit terminée
            await new Promise((resolve, reject) => {
                writeStream.on('finish', () => {
                    resolve();
                });
                writeStream.on('error', (error) => {
                    reject(error);
                });
            });
            // Supprimer le fichier QR Code temporaire
            try {
                await fs_1.promises.unlink(qrCodePath);
            }
            catch (unlinkError) {
                logger_utility_1.logger.warn(`Erreur lors de la suppression du QR code temporaire: ${unlinkError}`);
            }
            return filePath;
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la génération du PDF pour le billet ${billet.id}: ${error}`);
            throw new Error(`Erreur lors de la génération du PDF: ${error.message}`);
        }
    }
    /**
     * Génère un code QR pour un code-barre de billet
     */
    async generateQRCode(codeBarre, filePath) {
        try {
            const qrOptions = {
                errorCorrectionLevel: 'H',
                type: 'png',
                quality: 0.92,
                margin: 1,
                width: 300
            };
            await qrcode_1.default.toFile(filePath, codeBarre, qrOptions);
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la génération du QR code: ${error}`);
            throw error;
        }
    }
    /**
     * Formatte une date en format lisible
     */
    formatDate(date) {
        if (!date)
            return 'Date non spécifiée';
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleDateString('fr-FR', options);
    }
    /**
     * Nettoie les fichiers temporaires créés il y a plus de 2 heures
     */
    async cleanupTempFiles() {
        try {
            const files = await fs_1.promises.readdir(this.tempDir);
            const now = Date.now();
            const twoHoursAgo = now - (2 * 60 * 60 * 1000);
            for (const file of files) {
                if (file.startsWith('billet_') || file.startsWith('qrcode_')) {
                    const filePath = path_1.default.join(this.tempDir, file);
                    const stats = await fs_1.promises.stat(filePath);
                    if (stats.ctimeMs < twoHoursAgo) {
                        await fs_1.promises.unlink(filePath);
                        logger_utility_1.logger.info(`Fichier temporaire supprimé: ${file}`);
                    }
                }
            }
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors du nettoyage des fichiers temporaires: ${error}`);
        }
    }
    /**
     * Génère un rapport PDF pour une période donnée
     */
    async generateRapportPDF(dateDebut, dateFin, donnees) {
        try {
            const filename = `rapport_${this.formatDateFilename(dateDebut)}_${this.formatDateFilename(dateFin)}.pdf`;
            const filePath = path_1.default.join(this.tempDir, filename);
            const doc = new pdfkit_1.default({
                size: 'A4',
                margin: 50,
                info: {
                    Title: `Rapport de ventes du ${this.formatDate(dateDebut)} au ${this.formatDate(dateFin)}`,
                    Author: 'Billetterie'
                }
            });
            const writeStream = fs_1.promises.createWriteStream(filePath);
            doc.pipe(writeStream);
            // En-tête
            doc.fontSize(20).font('Helvetica-Bold').text('RAPPORT DE VENTES', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(14).font('Helvetica').text(`Période : ${this.formatDate(dateDebut)} au ${this.formatDate(dateFin)}`, { align: 'center' });
            doc.moveDown();
            // Résumé
            let totalBillets = 0;
            let totalVentes = 0;
            let tauxMoyen = 0;
            donnees.forEach(item => {
                totalBillets += item.nombre_billets || 0;
                totalVentes += parseFloat(item.montant_total) || 0;
                tauxMoyen += parseFloat(item.taux_remplissage) || 0;
            });
            tauxMoyen = donnees.length > 0 ? tauxMoyen / donnees.length : 0;
            doc.fontSize(14).font('Helvetica-Bold').text('Résumé');
            doc.fontSize(12).font('Helvetica').text(`Nombre total de billets vendus: ${totalBillets}`);
            doc.fontSize(12).text(`Montant total des ventes: ${totalVentes.toFixed(2)} €`);
            doc.fontSize(12).text(`Taux de remplissage moyen: ${tauxMoyen.toFixed(2)}%`);
            doc.moveDown();
            // Tableau détaillé
            doc.fontSize(14).font('Helvetica-Bold').text('Détail des ventes par événement');
            doc.moveDown(0.5);
            // Entêtes du tableau
            const startX = 50;
            let startY = doc.y;
            const colWidths = [200, 80, 80, 80];
            doc.font('Helvetica-Bold').fontSize(10);
            doc.text('Événement', startX, startY);
            doc.text('Billets', startX + colWidths[0], startY);
            doc.text('Montant (€)', startX + colWidths[0] + colWidths[1], startY);
            doc.text('Taux (%)', startX + colWidths[0] + colWidths[1] + colWidths[2], startY);
            startY = doc.y + 10;
            doc.moveTo(startX, startY).lineTo(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], startY).stroke();
            // Contenu du tableau
            startY += 10;
            doc.font('Helvetica').fontSize(10);
            donnees.forEach((item, index) => {
                // Vérifier s'il faut passer à une nouvelle page
                if (startY > doc.page.height - 100) {
                    doc.addPage();
                    startY = 50;
                }
                const evenement = item.evenement || 'N/A';
                const nombreBillets = item.nombre_billets || 0;
                const montant = parseFloat(item.montant_total) || 0;
                const taux = parseFloat(item.taux_remplissage) || 0;
                doc.text(evenement, startX, startY, { width: colWidths[0] - 10 });
                doc.text(nombreBillets.toString(), startX + colWidths[0], startY);
                doc.text(montant.toFixed(2), startX + colWidths[0] + colWidths[1], startY);
                doc.text(taux.toFixed(2), startX + colWidths[0] + colWidths[1] + colWidths[2], startY);
                startY += 20;
                // Ligne de séparation
                if (index < donnees.length - 1) {
                    doc.moveTo(startX, startY - 10).lineTo(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], startY - 10).stroke({ opacity: 0.5 });
                }
            });
            // Pied de page
            doc.fontSize(8).text(`Rapport généré le ${new Date().toLocaleString()}`, { align: 'center' });
            // Finaliser le document
            doc.end();
            // Attendre que l'écriture du fichier soit terminée
            await new Promise((resolve, reject) => {
                writeStream.on('finish', () => {
                    resolve();
                });
                writeStream.on('error', (error) => {
                    reject(error);
                });
            });
            return filePath;
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la génération du rapport PDF: ${error}`);
            throw new Error(`Erreur lors de la génération du rapport PDF: ${error.message}`);
        }
    }
    /**
     * Formatte une date pour l'utiliser dans un nom de fichier
     */
    formatDateFilename(date) {
        if (!date)
            return 'unknown';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
}
exports.PDFService = PDFService;
//# sourceMappingURL=pdf-service.js.map