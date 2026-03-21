export {
  parseMilestones,
  parseProgressUpdates,
  parseRating,
  type MilestoneItem,
  type ProgressUpdateItem,
} from "@/lib/services/progress/parser";

export { progressStatusBarClassName, progressStatusClassName, progressStatusLabel } from "@/lib/services/progress/presenter";

export {
  addMilestoneForStudent,
  addProgressUpdateForStudent,
  submitDeliverableForStudent,
  submitSmeEvaluationByStudent,
  markProjectCompletedBySme,
} from "@/lib/services/progress/use-cases";
