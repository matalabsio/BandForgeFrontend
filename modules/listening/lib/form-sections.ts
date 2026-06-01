/** Section labels for Greenfield-style form completion (Part 1). */

export type FormSectionMeta = {
  sectionTitle: string;
  showFormHeader: boolean;
};

export function formSectionForQuestion(questionNumber: number): FormSectionMeta {
  if (questionNumber <= 4) {
    return {
      sectionTitle: "Personal details",
      showFormHeader: questionNumber === 1,
    };
  }
  if (questionNumber <= 7) {
    return {
      sectionTitle: "Course details",
      showFormHeader: questionNumber === 5,
    };
  }
  return {
    sectionTitle: "Payment & additional information",
    showFormHeader: questionNumber === 8,
  };
}
