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

          {/* Statut d'activation */}
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
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="w-8 h-8 bg-cgt-red rounded flex items-center justify-center mx-auto mb-2">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-cgt-gray text-lg mb-1">
              {diversContent.title}
            </h4>
            {diversContent.subtitle && (
              <p className="text-sm text-gray-500 mb-2">
                {diversContent.subtitle}
              </p>
            )}
            <p className="text-gray-700 text-base">
              {diversContent.isActive && diversContent.content
                ? diversContent.content
                : "Informations diverses"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
