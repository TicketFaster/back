"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
const logger_utility_1 = require("../utils/logger-utility");
class PDFService {
    constructor() {
        // Créer un répertoire temporaire pour les PDF si nécessaire
        this.tempDir = path_1.default.join(__dirname, '..', '..', 'temp');
        if (!fs_1.default.existsSync(this.tempDir)) {
            fs_1.default.mkdirSync(this.tempDir, { recursive: true });
        }
    }
    /**
     * Génère un PDF pour un billet
     * @param billet Le billet à inclure dans le PDF
     * @returns Le chemin du fichier PDF généré
     */
    async generateBilletPDF(billet) {
        try {
            const pdfPath = path_1.default.join(this.tempDir, `billet_${billet.id}_${(0, uuid_1.v4)()}.pdf`);
            const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
            // Créer le PDF
            const stream = fs_1.default.createWriteStream(pdfPath);
            doc.pipe(stream);
            // En-tête du billet
            this.addHeader(doc, 'BILLET ÉLECTRONIQUE');
            // Informations sur l'événement
            if (billet.seance && billet.seance.evenement) {
                const evenement = billet.seance.evenement;
                doc.fontSize(16).text(evenement.titre, { align: 'center' });
                doc.moveDown();
                doc.fontSize(12).text(`Catégorie: ${evenement.categorie}`, { align: 'center' });
                doc.fontSize(10).text(`Durée: ${evenement.duree}`, { align: 'center' });
                doc.moveDown();
            }
            // Informations sur la séance
            if (billet.seance) {
                doc.fontSize(14).text('Informations de la séance', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(12).text(`Date et heure: ${this.formatDateTime(billet.seance.date_heure)}`);
                if (billet.seance.salle) {
                    doc.fontSize(12).text(`Salle: ${billet.seance.salle.nom}`);
                    doc.fontSize(12).text(`Configuration: ${billet.seance.salle.configuration}`);
                }
                doc.moveDown();
            }
            // Informations sur le billet
            doc.fontSize(14).text('Détails du billet', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).text(`Type de tarif: ${billet.type_tarif}`);
            doc.fontSize(12).text(`Prix: ${billet.prix_final.toFixed(2)} €`);
            doc.fontSize(12).text(`Statut: ${billet.statut}`);
            doc.fontSize(12).text(`ID Billet: ${billet.id}`);
            if (billet.reservation && billet.reservation.client) {
                const client = billet.reservation.client;
                doc.moveDown();
                doc.fontSize(14).text('Informations du client', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(12).text(`Nom: ${client.nom} ${client.prenom}`);
                doc.fontSize(12).text(`Email: ${client.email}`);
                doc.fontSize(12).text(`Téléphone: ${client.telephone}`);
            }
            // Ajouter un QR code avec le code-barre du billet
            doc.moveDown(2);
            if (billet.code_barre) {
                const qrCodeDataUrl = await qrcode_1.default.toDataURL(billet.code_barre);
                const qrImage = qrCodeDataUrl.split(';base64,').pop();
                if (qrImage) {
                    doc.fontSize(14).text('Scannez ce code pour valider votre billet:', { align: 'center' });
                    doc.moveDown(0.5);
                    doc.image(Buffer.from(qrImage, 'base64'), {
                        fit: [200, 200],
                        align: 'center'
                    });
                    doc.moveDown(0.5);
                    doc.fontSize(10).text(billet.code_barre, { align: 'center' });
                }
            }
            // Pied de page avec conditions d'utilisation
            doc.moveDown(2);
            this.addFooter(doc);
            // Finaliser le document
            doc.end();
            return new Promise((resolve, reject) => {
                stream.on('finish', () => resolve(pdfPath));
                stream.on('error', reject);
            });
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la génération du PDF pour le billet ${billet.id}`, error);
            throw new Error(`Erreur lors de la génération du PDF pour le billet ${billet.id}`);
        }
    }
    /**
     * Génère un PDF contenant plusieurs billets (pour une réservation)
     * @param billets Les billets à inclure dans le PDF
     * @returns Le chemin du fichier PDF généré
     */
    async generateMultipleBilletsPDF(billets) {
        try {
            if (!billets || billets.length === 0) {
                throw new Error('Aucun billet fourni pour la génération du PDF');
            }
            const reservationId = billets[0].id_reservation;
            const pdfPath = path_1.default.join(this.tempDir, `reservation_${reservationId}_${(0, uuid_1.v4)()}.pdf`);
            const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
            // Créer le PDF
            const stream = fs_1.default.createWriteStream(pdfPath);
            doc.pipe(stream);
            // En-tête de la réservation
            this.addHeader(doc, 'BILLETS DE RÉSERVATION');
            // Informations sur la réservation
            if (billets[0].reservation) {
                const reservation = billets[0].reservation;
                doc.fontSize(14).text(`Réservation #${reservation.id}`, { align: 'center' });
                doc.fontSize(12).text(`Date de réservation: ${this.formatDateTime(reservation.date_reservation)}`, { align: 'center' });
                doc.fontSize(12).text(`Statut: ${reservation.statut_paiement}`, { align: 'center' });
                doc.fontSize(12).text(`Nombre de billets: ${billets.length}`, { align: 'center' });
                doc.fontSize(12).text(`Montant total: ${reservation.montant_total.toFixed(2)} €`, { align: 'center' });
                doc.moveDown(2);
            }
            // Informations sur le client si disponible
            if (billets[0].reservation && billets[0].reservation.client) {
                const client = billets[0].reservation.client;
                doc.fontSize(14).text('Informations du client', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(12).text(`Nom: ${client.nom} ${client.prenom}`);
                doc.fontSize(12).text(`Email: ${client.email}`);
                doc.fontSize(12).text(`Téléphone: ${client.telephone}`);
                doc.moveDown(2);
            }
            // Pour chaque billet, ajouter une section
            for (let i = 0; i < billets.length; i++) {
                const billet = billets[i];
                // Ajouter un saut de page sauf pour le premier billet
                if (i > 0) {
                    doc.addPage();
                }
                // Titre du billet
                doc.fontSize(16).fillColor('#333').text(`BILLET #${i + 1}`, { align: 'center' });
                doc.moveDown();
                // Informations sur l'événement
                if (billet.seance && billet.seance.evenement) {
                    const evenement = billet.seance.evenement;
                    doc.fontSize(14).text(evenement.titre, { align: 'center' });
                    doc.fontSize(10).text(`Catégorie: ${evenement.categorie} - Durée: ${evenement.duree}`, { align: 'center' });
                    doc.moveDown();
                }
                // Informations sur la séance
                if (billet.seance) {
                    doc.fontSize(12).text('Informations de la séance:', { underline: true });
                    doc.moveDown(0.5);
                    doc.fontSize(10).text(`Date et heure: ${this.formatDateTime(billet.seance.date_heure)}`);
                    if (billet.seance.salle) {
                        doc.fontSize(10).text(`Salle: ${billet.seance.salle.nom} (${billet.seance.salle.configuration})`);
                    }
                    doc.moveDown();
                }
                // Informations sur le billet
                doc.fontSize(12).text('Détails du billet:', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10).text(`Type de tarif: ${billet.type_tarif}`);
                doc.fontSize(10).text(`Prix: ${billet.prix_final.toFixed(2)} €`);
                doc.fontSize(10).text(`ID Billet: ${billet.id}`);
                doc.moveDown();
                // Ajouter un QR code avec le code-barre du billet
                if (billet.code_barre) {
                    const qrCodeDataUrl = await qrcode_1.default.toDataURL(billet.code_barre);
                    const qrImage = qrCodeDataUrl.split(';base64,').pop();
                    if (qrImage) {
                        doc.fontSize(12).text('Scannez ce code pour valider votre billet:', { align: 'center' });
                        doc.moveDown(0.5);
                        doc.image(Buffer.from(qrImage, 'base64'), {
                            fit: [150, 150],
                            align: 'center'
                        });
                        doc.moveDown(0.5);
                        doc.fontSize(8).text(billet.code_barre, { align: 'center' });
                    }
                }
            }
            // Pied de page
            doc.moveDown();
            this.addFooter(doc);
            // Finaliser le document
            doc.end();
            return new Promise((resolve, reject) => {
                stream.on('finish', () => resolve(pdfPath));
                stream.on('error', reject);
            });
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la génération du PDF pour les billets', error);
            throw new Error('Erreur lors de la génération du PDF pour les billets');
        }
    }
    /**
     * Ajoute un en-tête au document PDF
     */
    addHeader(doc, title) {
        // Logo (à remplacer par le chemin vers le logo)
        // doc.image('path/to/logo.png', 50, 45, { width: 50 });
        // Titre
        doc.fontSize(24).fillColor('#333').text(title, { align: 'center' });
        // Ligne de séparation
        doc.moveDown();
        doc.moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .stroke('#cccccc');
        doc.moveDown(2);
    }
    /**
     * Ajoute un pied de page au document PDF
     */
    addFooter(doc) {
        const y = doc.page.height - 120;
        doc.fontSize(8).fillColor('#666666').text('Conditions d\'utilisation:', 50, y);
        doc.moveDown(0.5);
        doc.fontSize(8).fillColor('#666666').text('- Ce billet est valable uniquement pour la séance indiquée.');
        doc.fontSize(8).fillColor('#666666').text('- Présentez ce billet à l\'entrée (version imprimée ou sur écran).');
        doc.fontSize(8).fillColor('#666666').text('- Aucun remboursement ne sera effectué après achat, sauf annulation de l\'événement.');
        doc.moveDown(0.5);
        doc.fontSize(8).fillColor('#666666').text(`Généré le ${new Date().toLocaleString('fr-FR')} - TicketFaster`, { align: 'center' });
    }
    /**
     * Formate une date et heure dans un format français lisible
     */
    formatDateTime(date) {
        if (!date)
            return 'Non spécifié';
        return date.toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    /**
     * Nettoie les fichiers temporaires
     */
    cleanTempFiles() {
        try {
            if (fs_1.default.existsSync(this.tempDir)) {
                // Récupérer tous les fichiers du répertoire temporaire
                const files = fs_1.default.readdirSync(this.tempDir);
                // Supprimer les fichiers plus anciens que 24 heures
                const now = Date.now();
                const oneDayInMs = 24 * 60 * 60 * 1000;
                for (const file of files) {
                    const filePath = path_1.default.join(this.tempDir, file);
                    const stats = fs_1.default.statSync(filePath);
                    if (now - stats.mtimeMs > oneDayInMs) {
                        fs_1.default.unlinkSync(filePath);
                        logger_utility_1.logger.info(`Fichier temporaire supprimé: ${filePath}`);
                    }
                }
            }
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors du nettoyage des fichiers temporaires', error);
        }
    }
    /**
     * Génère un rapport de ventes basé sur les données fournies
     * @param rapportData Les données du rapport de ventes
     * @returns Le chemin du fichier PDF généré
     */
    async generateRapportVentesPDF(rapportData) {
        try {
            const pdfPath = path_1.default.join(this.tempDir, `rapport_ventes_${(0, uuid_1.v4)()}.pdf`);
            const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
            // Créer le PDF
            const stream = fs_1.default.createWriteStream(pdfPath);
            doc.pipe(stream);
            // En-tête du rapport
            this.addHeader(doc, 'RAPPORT DE VENTES');
            // Informations générales
            const dateDebut = rapportData.length > 0 ? new Date(rapportData[0].date_heure) : new Date();
            const dateFin = rapportData.length > 0 ? new Date(rapportData[rapportData.length - 1].date_heure) : new Date();
            doc.fontSize(12).text(`Période: du ${this.formatDateTime(dateDebut)} au ${this.formatDateTime(dateFin)}`);
            doc.fontSize(12).text(`Nombre d'événements: ${rapportData.length}`);
            // Calculer le total des ventes
            let totalBillets = 0;
            let totalMontant = 0;
            let tauxRemplissageMoyen = 0;
            rapportData.forEach(r => {
                totalBillets += r.nombre_billets;
                totalMontant += r.montant_total;
                tauxRemplissageMoyen += r.taux_remplissage;
            });
            if (rapportData.length > 0) {
                tauxRemplissageMoyen = tauxRemplissageMoyen / rapportData.length;
            }
            doc.fontSize(12).text(`Total des billets vendus: ${totalBillets}`);
            doc.fontSize(12).text(`Montant total des ventes: ${totalMontant.toFixed(2)} €`);
            doc.fontSize(12).text(`Taux de remplissage moyen: ${tauxRemplissageMoyen.toFixed(2)}%`);
            doc.moveDown(2);
            // Tableau des ventes
            doc.fontSize(14).text('Détail des ventes', { underline: true });
            doc.moveDown();
            // En-têtes du tableau
            const tableTop = doc.y;
            const tableLeft = 50;
            const colWidths = [200, 80, 80, 100];
            doc.fontSize(10).text('Événement', tableLeft, tableTop);
            doc.fontSize(10).text('Billets', tableLeft + colWidths[0], tableTop);
            doc.fontSize(10).text('Montant', tableLeft + colWidths[0] + colWidths[1], tableTop);
            doc.fontSize(10).text('Taux rempl.', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
            doc.moveDown();
            let tableY = doc.y;
            // Ligne de séparation
            doc.moveTo(tableLeft, tableY)
                .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableY)
                .stroke('#cccccc');
            doc.moveDown(0.5);
            tableY = doc.y;
            // Données du tableau
            for (const item of rapportData) {
                // Vérifier s'il faut passer à une nouvelle page
                if (tableY > doc.page.height - 150) {
                    doc.addPage();
                    tableY = 50;
                }
                // Informations de l'événement
                const evenementText = `${item.evenement}\n${this.formatDateTime(new Date(item.date_heure))}`;
                const evenementLines = doc.fontSize(10).heightOfString(evenementText, { width: colWidths[0] - 10 });
                doc.fontSize(10).text(evenementText, tableLeft, tableY, { width: colWidths[0] - 10 });
                doc.fontSize(10).text(item.nombre_billets.toString(), tableLeft + colWidths[0], tableY);
                doc.fontSize(10).text(`${item.montant_total.toFixed(2)} €`, tableLeft + colWidths[0] + colWidths[1], tableY);
                doc.fontSize(10).text(`${item.taux_remplissage.toFixed(2)}%`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableY);
                // Mise à jour de la position Y pour la prochaine ligne
                tableY += Math.max(evenementLines, 20) + 5;
                // Ligne de séparation
                doc.moveTo(tableLeft, tableY - 3)
                    .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableY - 3)
                    .stroke('#eeeeee');
            }
            // Pied de page
            doc.moveDown(2);
            this.addFooter(doc);
            // Finaliser le document
            doc.end();
            return new Promise((resolve, reject) => {
                stream.on('finish', () => resolve(pdfPath));
                stream.on('error', reject);
            });
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la génération du PDF du rapport de ventes', error);
            throw new Error('Erreur lors de la génération du PDF du rapport de ventes');
        }
    }
}
exports.PDFService = PDFService;
//# sourceMappingURL=pdf-service.js.map