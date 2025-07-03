-- Fonction RPC pour supprimer un utilisateur (contourne RLS)

CREATE OR REPLACE FUNCTION delete_user_by_id(user_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM users WHERE id = user_id;
  
  -- Vérifier si la suppression a réussi
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION delete_user_by_id TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_by_id TO anon;
