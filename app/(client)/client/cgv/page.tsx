import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, CreditCard, ShieldCheck, RefreshCcw } from "lucide-react";

export default function CGVPage() {
    const lastUpdate = "18 février 2026";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">

                <Link href="/">
                    <Button variant="ghost" className="mb-4 hover:text-trust-blue">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Retour à l'accueil
                    </Button>
                </Link>

                <div className="text-center sm:text-left space-y-2">
                    <h1 className="text-3xl font-extrabold text-trust-blue dark:text-eco-mint sm:text-4xl">
                        Conditions Générales de Vente
                    </h1>
                    <p className="text-zinc-500">Dernière mise à jour : {lastUpdate}</p>
                </div>

                <Card className="border-none shadow-md">
                    <CardContent className="pt-6 prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 space-y-6">

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-action-orange" />
                                1. Prix et Facturation
                            </h2>
                            <p>
                                Les prix des prestations de livraison sont indiqués en Euros et calculés selon des critères précis (poids du colis, distance, urgence). Ils incluent les taxes applicables au jour de la commande. Une facture détaillée est mise à disposition de l'expéditeur dans son espace personnel immédiatement après le paiement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                2. Modalités de paiement
                            </h2>
                            <p>
                                Le règlement des prestations s'effectue exclusivement par carte bancaire via le prestataire de paiement sécurisé Stripe. Les fonds sont prélevés lors de la validation de la mission par l'expéditeur et conservés sur un compte de cantonnement jusqu'à la confirmation de la livraison finale.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                <RefreshCcw className="h-5 w-5 text-action-orange" />
                                3. Annulation et Rétractation
                            </h2>
                            <p>
                                Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de prestations de services de transport de biens. Toutefois, Eco-Relais autorise l'annulation gratuite d'une mission tant qu'aucun Partenaire (Voisin-Relais) n'a accepté la prise en charge. Passé ce délai, des frais d'annulation pourront être appliqués.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                4. Exécution du service et Livraison
                            </h2>
                            <p>
                                Le service est considéré comme exécuté dès que le statut de la mission passe à "Livré" dans l'application, validé par le scan du QR Code de livraison. Eco-Relais agit en tant que plateforme de mise en relation et ne saurait être tenu responsable des retards liés à des impondérables de transport rencontrés par le Partenaire.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-action-orange" />
                                5. Politique de Remboursement
                            </h2>
                            <p>
                                En cas de litige avéré (colis non livré ou endommagé), une demande doit être ouverte via le module dédié. Le remboursement total ou partiel sera effectué sur la carte bancaire ayant servi au paiement après enquête des services d'administration d'Eco-Relais.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                6. Service Client et Réclamations
                            </h2>
                            <p>
                                Pour toute question relative à une commande ou à un paiement, notre service client est joignable via l'onglet "Aide" du dashboard ou par courrier électronique à l'adresse support@eco-relais.fr.
                            </p>
                        </section>

                    </CardContent>
                </Card>

                <div className="text-center pb-8">
                    <p className="text-sm text-zinc-500">
                        En validant votre commande, vous acceptez sans réserve ces conditions.
                    </p>
                </div>
            </div>
        </div>
    );
}