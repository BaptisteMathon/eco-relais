import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

export default function CGUPage() {
    const lastUpdate = "18 février 2026";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">

                <Link href="/client/dashboard">
                    <Button variant="ghost" className="mb-4 hover:text-trust-blue">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Retour à l'accueil
                    </Button>
                </Link>

                <div className="text-center sm:text-left space-y-2">
                    <h1 className="text-3xl font-extrabold text-trust-blue dark:text-eco-mint sm:text-4xl">
                        Conditions Générales d'Utilisation
                    </h1>
                    <p className="text-zinc-500">Dernière mise à jour : {lastUpdate}</p>
                </div>

                <Card className="border-none shadow-md">
                    <CardContent className="pt-6 prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 space-y-6">

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                1. Accès au service et création de compte
                            </h2>
                            <p>
                                L'utilisation de la plateforme Eco-Relais nécessite la création d'un compte personnel. L'utilisateur doit être âgé d'au moins 18 ans et fournir des informations exactes et sincères. La plateforme propose trois rôles distincts : Client, Partenaire (Voisin-Relais) et Administrateur.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                2. Règles de conduite et interdictions
                            </h2>
                            <p>
                                L'utilisateur s'engage à utiliser le service de bonne foi. Sont strictement interdits :
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Toute tentative de fraude au paiement ou aux missions.</li>
                                <li>Le transport de produits illicites, dangereux ou contraires à la réglementation en vigueur.</li>
                                <li>L'usurpation d'identité ou la fourniture de fausses preuves de livraison.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                3. Responsabilités de l'utilisateur
                            </h2>
                            <p>
                                L'utilisateur est seul responsable de la confidentialité de ses identifiants. Il s'engage à notifier Eco-Relais sans délai en cas d'accès non autorisé. Les informations fournies lors de la création d'une mission (poids, dimensions, adresses) engagent la responsabilité de l'expéditeur.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                4. Disponibilité du service
                            </h2>
                            <p>
                                Eco-Relais s'efforce d'assurer une disponibilité 24h/24. Toutefois, l'accès peut être suspendu pour maintenance technique ou en cas de force majeure. Eco-Relais ne pourra être tenu responsable des dommages résultant d'une indisponibilité temporaire.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                5. Suspension et fermeture de compte
                            </h2>
                            <p>
                                En cas de violation des présentes CGU ou de litiges répétés, Eco-Relais se réserve le droit de suspendre ou de supprimer un compte utilisateur sans préavis.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                6. Propriété intellectuelle
                            </h2>
                            <p>
                                L'application, les marques, les logos (ER) et tous les contenus présents sur la plateforme sont la propriété exclusive d'Eco-Relais. Toute reproduction sans autorisation est interdite.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-trust-blue flex items-center gap-2">
                                7. Loi applicable et juridiction
                            </h2>
                            <p>
                                Les présentes CGU sont régies par la loi française. Tout litige relatif à leur exécution sera soumis à la compétence exclusive des tribunaux français.
                            </p>
                        </section>

                    </CardContent>
                </Card>

                <div className="text-center pb-8">
                    <p className="text-sm text-zinc-500">
                        Vous avez des questions sur nos conditions ?
                        <Link href="mailto:contact@eco-relais.fr" className="ml-1 text-eco-green hover:underline">
                            Contactez-nous
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}