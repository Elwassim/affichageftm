// Remplacement temporaire pour handleDeleteMeeting
const handleDeleteMeeting = async (id) => {
  try {
    const success = await deleteMeetingFromDB(id);
    if (success) {
      await refresh();
      toast({
        title: "Succès",
        description: "Réunion supprimée avec succès.",
      });
    }
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Impossible de supprimer la réunion.",
      variant: "destructive",
    });
  }
};
