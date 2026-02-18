import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Lock, Eye, Database, UserCheck } from "lucide-react";

export default function PrivacyPage() {
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
                        Politique de Confidentialité (RGPD)
                    </h1>
                    <p className="text-zinc-500 text-sm">Dernière mise à jour : {lastUpdate}</p>
                </div>

                <Card className="border-none shadow-md">
                    <CardContent className="pt-6 prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 space-y-8">

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                <Database className="h-5 w-5 text-eco-green" />
                                1. Données collectées et finalités
                            </h2>
                            <p>
                                Nous collectons uniquement les données nécessaires au bon fonctionnement d'Eco-Relais :
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Identification :</strong> Nom, prénom, email, téléphone pour la gestion de votre compte.</li>
                                <li><strong>Localisation :</strong> Adresses de collecte et de livraison, géolocalisation pour l'affichage de la carte des missions.</li>
                                <li><strong>Paiement :</strong> Identifiants de transaction gérés de manière sécurisée par notre sous-traitant Stripe.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                <Eye className="h-5 w-5 text-eco-green" />
                                2. Partage et sous-traitance
                            </h2>
                            <p>
                                Vos données sont traitées au sein de l'Union Européenne. Nous partageons certaines informations strictement nécessaires avec :
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Stripe :</strong> Pour le traitement sécurisé des paiements et la lutte contre la fraude.</li>
                                <li><strong>Hébergement :</strong> Nos serveurs assurent le stockage sécurisé de vos données d'utilisation.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-eco-green" />
                                3. Vos droits (RGPD)
                            </h2>
                            <p>
                                Conformément au règlement européen, vous disposez de droits spécifiques sur vos données personnelles :
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Droit d'accès et de correction :</strong> Modifiables directement depuis votre profil.</li>
                                <li><strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression de votre compte et de vos données associées.</li>
                                <li><strong>Droit à la portabilité :</strong> Export de vos données sur simple demande.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                <Lock className="h-5 w-5 text-eco-green" />
                                4. Sécurité et conservation
                            </h2>
                            <p>
                                Eco-Relais met en œuvre des mesures de sécurité techniques (chiffrement, logs) pour protéger vos données contre tout accès non autorisé. Les données relatives aux missions sont conservées pendant la durée légale nécessaire à des fins de facturation et de gestion des litiges.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-xl font-bold text-trust-blue mb-4">Tableau de conservation des données</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-100 dark:bg-zinc-900">
                                            <th className="p-2 border">Type de donnée</th>
                                            <th className="p-2 border">Durée</th>
                                            <th className="p-2 border">Raison</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="p-2 border">Compte utilisateur</td>
                                            <td className="p-2 border">Vie du compte + 3 ans</td>
                                            <td className="p-2 border">Relation commerciale</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border">Historique de missions</td>
                                            <td className="p-2 border">10 ans</td>
                                            <td className="p-2 border">Obligation comptable</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border">Géolocalisation</td>
                                            <td className="p-2 border">Fin de la mission</td>
                                            <td className="p-2 border">Preuve de livraison</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                    </CardContent>
                </Card>



                <div className="text-center pb-8">
                    <p className="text-sm text-zinc-500">
                        Pour exercer vos droits ou pour toute question, contactez notre Délégué à la Protection des Données (DPO) à
                        <Link href="mailto:rgpd@eco-relais.fr" className="ml-1 text-trust-blue hover:underline">
                            rgpd@eco-relais.fr
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}