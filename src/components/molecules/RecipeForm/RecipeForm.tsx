import { RecipeFormProps } from "./types";
import RecipeFormDisplay from "./RecipeFormDisplay";

export default function RecipeForm(props: RecipeFormProps) {
  const {
    recipe,
    onClose,
    onNameUpdate,
    name,
    onComponentQuantityUpdate,
    onComponentAdd,
  } = props;

  return (
    <RecipeFormDisplay
      recipe={recipe}
      onClose={onClose}
      onNameUpdate={onNameUpdate}
      onComponentQuantityUpdate={onComponentQuantityUpdate}
      onComponentAdd={onComponentAdd}
      name={name}
    />
  );
}
