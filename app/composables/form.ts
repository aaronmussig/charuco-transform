import {isNumber} from "~/assets/ts/common";
import type { Ref } from "vue";
import type {numericValidationFn} from "~/assets/ts/validation";

export const useNumericInput = (
    model: Ref<number | undefined>,
    isValidFn?: numericValidationFn
) => {

    // States
    const isValid = ref(true);
    const inputForm = ref("");

    // Set starting string based on current model
    onMounted(() => {
        if (model.value !== undefined) {
            inputForm.value = String(model.value);
        }
    });

    // Update text box if the model changes from outside
    watch(model, (newModelValue) => {
        const currentInputAsNumber = parseFloat(inputForm.value);

        // Only update if the values actually differ
        if (newModelValue !== currentInputAsNumber) {
            inputForm.value = newModelValue !== undefined ? String(newModelValue) : "";
            isValid.value = true;
        }
    });

    // Validate and sync text input to the numeric model
    watch(inputForm, (newStringValue) => {
        // Empty input is invalid
        if (newStringValue === "") {
            isValid.value = false;
            return;
        }
        // Check if it's a number
        if (!isNumber(newStringValue)) {
            isValid.value = false;
            return;
        }
        // Convert to number
        const castValue: number = parseFloat(newStringValue);
        if (!Number.isFinite(castValue)) {
            isValid.value = false;
            return;
        }
        // Maybe run the custom validation function
        if (isValidFn != undefined && !isValidFn(castValue)) {
            isValid.value = false;
            return;
        }
        // All good
        isValid.value = true;
        model.value = castValue;
    });

    function maybeReset() {
        if (!isValid.value) {
            inputForm.value = model.value !== undefined ? String(model.value) : "";
            isValid.value = true;
        }
    }

    return {
        inputForm,
        isValid,
        maybeReset
    };
};