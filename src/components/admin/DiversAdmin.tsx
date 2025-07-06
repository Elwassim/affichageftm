import React, { useState, useEffect } from "react";
import { Info, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getConfig, updateConfig } from "@/lib/database";

interface DiversContent {
  title: string;
  subtitle: string;
  content: string;
  isActive: boolean;
  // Options avancées
  backgroundColor: string;
  textColor: string;
  icon: string;
  showIcon: boolean;
  image?: string;
  showImage: boolean;
  link?: string;
  linkText?: string;
  showBorder: boolean;
  borderColor: string;
  fontSize: "small" | "medium" | "large";
  alignment: "left" | "center" | "right";
  style: "default" | "highlight" | "warning" | "success";
}

export const DiversAdmin: React.FC = () => {
  const [diversContent, setDiversContent] = useState<DiversContent>({
    title: "Informations diverses",
    subtitle: "CGT FTM",
    content: "Aucune information particulière pour le moment.",
    isActive: false,
    backgroundColor: "#ffffff",
    textColor: "#374151",
    icon: "Info",
    showIcon: true,
    image: "",
    showImage: false,
    link: "",
    linkText: "",
    showBorder: false,
    borderColor: "#e5e7eb",
    fontSize: "medium",
    alignment: "center",
    style: "default",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Charger le contenu existant
  useEffect(() => {
    const loadDiversContent = async () => {
      try {
        setLoading(true);
        const content = await getConfig("diversContent");
        if (content) {
          setDiversContent(JSON.parse(content));
        }
      } catch (error) {
        console.error("Erreur lors du chargement du contenu divers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDiversContent();
  }, []);

  // Sauvegarder les modifications
  const handleSave = async () => {
    try {
      setSaving(true);

      const jsonContent = JSON.stringify(diversContent);
      await updateConfig("diversContent", jsonContent);

      // Save to localStorage with timestamp for cross-page sync
      localStorage.setItem("diversContent", jsonContent);
      localStorage.setItem("diversContent-timestamp", Date.now().toString());

      // Trigger storage event for cross-page communication
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "diversContent",
          newValue: jsonContent,
          storageArea: localStorage,
        }),
      );

      // Also dispatch local event if on same page
      window.dispatchEvent(
        new CustomEvent("cgt-config-updated", {
          detail: {
            key: "diversContent",
            value: diversContent,
          },
        }),
      );

      console.log(
        "✅ DiversAdmin: Contenu sauvé avec sync cross-page",
        diversContent,
      );

      toast({
        title: "Succès",
        description: "Contenu divers mis à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le contenu divers.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Réinitialiser aux valeurs par défaut
  const handleReset = () => {
    setDiversContent({
      title: "Informations diverses",
      subtitle: "CGT FTM",
      content: "Aucune information particulière pour le moment.",
      isActive: false,
      backgroundColor: "#ffffff",
      textColor: "#374151",
      icon: "Info",
      showIcon: true,
      image: "",
      showImage: false,
      link: "",
      linkText: "",
      showBorder: false,
      borderColor: "#e5e7eb",
      fontSize: "medium",
      alignment: "center",
      style: "default",
    });
  };

  // Test de synchronisation
  const handleTestSync = () => {
    console.log("🧪 Test de synchronisation Divers:", diversContent);

    // Émettre l'événement de mise à jour
    window.dispatchEvent(
      new CustomEvent("cgt-config-updated", {
        detail: {
          key: "diversContent",
          value: diversContent,
        },
      }),
    );

    toast({
      title: "Test de synchronisation",
      description: "Événement envoyé au dashboard. Vérifiez la console.",
    });
  };

  // Force une synchronisation au montage du composant
  useEffect(() => {
    if (!loading && diversContent) {
      console.log("🔄 DiversAdmin: Force sync au montage", diversContent);
      window.dispatchEvent(
        new CustomEvent("cgt-config-updated", {
          detail: {
            key: "diversContent",
            value: diversContent,
          },
        }),
      );
    }
  }, [loading, diversContent]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-cgt-red" />
          <span className="ml-2 text-gray-600">Chargement...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="admin-section-header">
        <div className="admin-section-title">
          <div className="admin-section-icon bg-indigo-100">
            <Info className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Gestion du widget Divers
            </h2>
            <p className="text-gray-600">
              Configurez le contenu affiché dans le widget d'informations
              diverses
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Contenu principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre principal</Label>
              <Input
                id="title"
                value={diversContent.title}
                onChange={(e) =>
                  setDiversContent({ ...diversContent, title: e.target.value })
                }
                placeholder="Ex: Informations importantes"
              />
            </div>

            {/* Sous-titre */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input
                id="subtitle"
                value={diversContent.subtitle}
                onChange={(e) =>
                  setDiversContent({
                    ...diversContent,
                    subtitle: e.target.value,
                  })
                }
                placeholder="Ex: CGT FTM"
              />
            </div>
          </div>

          {/* Contenu */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenu à afficher</Label>
            <Textarea
              id="content"
              value={diversContent.content}
              onChange={(e) =>
                setDiversContent({ ...diversContent, content: e.target.value })
              }
              placeholder="Saisissez le contenu à afficher dans le widget divers..."
              rows={4}
            />
          </div>

          {/* Options d'apparence */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Apparence
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Style prédéfini */}
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <select
                  id="style"
                  value={diversContent.style}
                  onChange={(e) =>
                    setDiversContent({
                      ...diversContent,
                      style: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="default">Par défaut</option>
                  <option value="highlight">Mise en avant</option>
                  <option value="warning">Avertissement</option>
                  <option value="success">Succès</option>
                </select>
              </div>

              {/* Taille du texte */}
              <div className="space-y-2">
                <Label htmlFor="fontSize">Taille du texte</Label>
                <select
                  id="fontSize"
                  value={diversContent.fontSize}
                  onChange={(e) =>
                    setDiversContent({
                      ...diversContent,
                      fontSize: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="small">Petit</option>
                  <option value="medium">Moyen</option>
                  <option value="large">Grand</option>
                </select>
              </div>

              {/* Alignement */}
              <div className="space-y-2">
                <Label htmlFor="alignment">Alignement</Label>
                <select
                  id="alignment"
                  value={diversContent.alignment}
                  onChange={(e) =>
                    setDiversContent({
                      ...diversContent,
                      alignment: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="left">Gauche</option>
                  <option value="center">Centre</option>
                  <option value="right">Droite</option>
                </select>
              </div>
            </div>

            {/* Couleurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Couleur de fond */}
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Couleur de fond</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={diversContent.backgroundColor}
                    onChange={(e) =>
                      setDiversContent({
                        ...diversContent,
                        backgroundColor: e.target.value,
                      })
                    }
                    className="w-16 h-10"
                  />
                  <Input
                    value={diversContent.backgroundColor}
                    onChange={(e) =>
                      setDiversContent({
                        ...diversContent,
                        backgroundColor: e.target.value,
                      })
                    }
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Couleur du texte */}
              <div className="space-y-2">
                <Label htmlFor="textColor">Couleur du texte</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={diversContent.textColor}
                    onChange={(e) =>
                      setDiversContent({
                        ...diversContent,
                        textColor: e.target.value,
                      })
                    }
                    className="w-16 h-10"
                  />
                  <Input
                    value={diversContent.textColor}
                    onChange={(e) =>
                      setDiversContent({
                        ...diversContent,
                        textColor: e.target.value,
                      })
                    }
                    placeholder="#374151"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Options d'icône */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Icône</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Afficher l'icône */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showIcon"
                  checked={diversContent.showIcon}
                  onChange={(e) =>
                    setDiversContent({
                      ...diversContent,
                      showIcon: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-cgt-red border-gray-300 rounded focus:ring-cgt-red"
                />
                <Label htmlFor="showIcon">Afficher une icône</Label>
              </div>

              {/* Choix de l'icône */}
              {diversContent.showIcon && (
                <div className="space-y-2">
                  <Label htmlFor="icon">Type d'icône</Label>
                  <select
                    id="icon"
                    value={diversContent.icon}
                    onChange={(e) =>
                      setDiversContent({
                        ...diversContent,
                        icon: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Info">Information</option>
                    <option value="AlertTriangle">Attention</option>
                    <option value="CheckCircle">Succès</option>
                    <option value="Bell">Notification</option>
                    <option value="Megaphone">Annonce</option>
                    <option value="Calendar">Calendrier</option>
                    <option value="Clock">Horloge</option>
                    <option value="Users">Personnes</option>
                    <option value="Star">Étoile</option>
                    <option value="Heart">Cœur</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Options de lien */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lien (optionnel)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* URL du lien */}
              <div className="space-y-2">
                <Label htmlFor="link">URL du lien</Label>
                <Input
                  id="link"
                  value={diversContent.link || ""}
                  onChange={(e) =>
                    setDiversContent({ ...diversContent, link: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>

              {/* Texte du lien */}
              <div className="space-y-2">
                <Label htmlFor="linkText">Texte du lien</Label>
                <Input
                  id="linkText"
                  value={diversContent.linkText || ""}
                  onChange={(e) =>
                    setDiversContent({
                      ...diversContent,
                      linkText: e.target.value,
                    })
                  }
                  placeholder="En savoir plus"
                />
              </div>
            </div>
          </div>

          {/* Options de bordure */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bordure
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Afficher la bordure */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showBorder"
                  checked={diversContent.showBorder}
                  onChange={(e) =>
                    setDiversContent({
                      ...diversContent,
                      showBorder: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-cgt-red border-gray-300 rounded focus:ring-cgt-red"
                />
                <Label htmlFor="showBorder">Afficher une bordure</Label>
              </div>

              {/* Couleur de la bordure */}
              {diversContent.showBorder && (
                <div className="space-y-2">
                  <Label htmlFor="borderColor">Couleur de la bordure</Label>
                  <div className="flex gap-2">
                    <Input
                      id="borderColor"
                      type="color"
                      value={diversContent.borderColor}
                      onChange={(e) =>
                        setDiversContent({
                          ...diversContent,
                          borderColor: e.target.value,
                        })
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      value={diversContent.borderColor}
                      onChange={(e) =>
                        setDiversContent({
                          ...diversContent,
                          borderColor: e.target.value,
                        })
                      }
                      placeholder="#e5e7eb"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statut d'activation */}
          <div className="border-t pt-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={diversContent.isActive}
                onChange={(e) =>
                  setDiversContent({
                    ...diversContent,
                    isActive: e.target.checked,
                  })
                }
                className="w-4 h-4 text-cgt-red border-gray-300 rounded focus:ring-cgt-red"
              />
              <Label htmlFor="isActive">
                Afficher le contenu personnalisé (sinon affiche le message par
                défaut)
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-cgt-red hover:bg-cgt-red-dark text-white"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>

            <Button onClick={handleReset} variant="outline" disabled={saving}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>

            <Button onClick={handleTestSync} variant="outline">
              <Info className="w-4 h-4 mr-2" />
              Test Sync
            </Button>
          </div>
        </div>
      </Card>

      {/* Aperçu */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Aperçu du widget
        </h3>
        <div
          className="rounded-lg p-4 border-2 border-dashed border-gray-200"
          style={{
            backgroundColor: diversContent.backgroundColor,
            borderColor: diversContent.showBorder
              ? diversContent.borderColor
              : undefined,
            borderStyle: diversContent.showBorder ? "solid" : "dashed",
            textAlign: diversContent.alignment as any,
            color: diversContent.textColor,
          }}
        >
          <div>
            {/* Icône */}
            {diversContent.showIcon && (
              <div
                className="w-8 h-8 bg-cgt-red rounded flex items-center justify-center mx-auto mb-2"
                style={{
                  marginLeft:
                    diversContent.alignment === "left"
                      ? 0
                      : diversContent.alignment === "right"
                        ? "auto"
                        : "auto",
                  marginRight:
                    diversContent.alignment === "right"
                      ? 0
                      : diversContent.alignment === "left"
                        ? "auto"
                        : "auto",
                }}
              >
                <Info className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Titre */}
            <h4
              className={`font-bold mb-1 ${
                diversContent.fontSize === "small"
                  ? "text-base"
                  : diversContent.fontSize === "large"
                    ? "text-xl"
                    : "text-lg"
              }`}
              style={{ color: diversContent.textColor }}
            >
              {diversContent.title}
            </h4>

            {/* Sous-titre */}
            {diversContent.subtitle && (
              <p
                className={`text-gray-500 mb-2 ${
                  diversContent.fontSize === "small"
                    ? "text-sm"
                    : diversContent.fontSize === "large"
                      ? "text-base"
                      : "text-sm"
                }`}
              >
                {diversContent.subtitle}
              </p>
            )}

            {/* Contenu */}
            <p
              className={`${
                diversContent.fontSize === "small"
                  ? "text-sm"
                  : diversContent.fontSize === "large"
                    ? "text-lg"
                    : "text-base"
              }`}
              style={{ color: diversContent.textColor }}
            >
              {diversContent.isActive && diversContent.content
                ? diversContent.content
                : "Informations diverses"}
            </p>

            {/* Lien */}
            {diversContent.link && diversContent.linkText && (
              <div className="mt-3">
                <a
                  href={diversContent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-cgt-red hover:text-cgt-red-dark font-medium text-sm"
                >
                  {diversContent.linkText}
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}

            {/* Indicateur de style */}
            <div className="mt-2 text-xs text-gray-400">
              Style: {diversContent.style} | Taille: {diversContent.fontSize} |
              Alignement: {diversContent.alignment}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
