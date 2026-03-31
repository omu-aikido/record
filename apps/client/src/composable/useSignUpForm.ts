import type { ClerkAPIError } from '@clerk/vue/types';
import { useClerk } from '@clerk/vue';
import { ArkErrors, type } from 'arktype';
import { reactive, readonly, ref } from 'vue';

const formDataSchema = type({
  email: /.+@.+\..+/,
  newPassword: '10<=string<=100',
  firstName: '2<=string<=50',
  lastName: '2<=string<=50',
  username: "6<=string<=50 | '' | undefined",
  year: 'string',
  grade: 'number',
  joinedAt: 'number',
  getGradeAt: 'string | null',
  legalAccepted: 'boolean',
});

export type SignUpFormData = typeof formDataSchema.infer;
export type FormErrors = Record<keyof SignUpFormData | 'general', string>;

type SignUpStep = 'basic' | 'personal' | 'profile';

const getValidationSchema = (currentStep: SignUpStep) => {
  switch (currentStep) {
    case 'basic':
      return type({ email: /.+@.+\..+/, newPassword: '10<=string<=100' });
    case 'personal':
      return type({
        firstName: '2<=string<=50',
        lastName: '2<=string<=50',
        username: "6<=string<=50 | '' | undefined",
      });
    case 'profile':
      return type({
        year: 'string',
        grade: 'number',
        joinedAt: 'number',
        getGradeAt: 'string | null',
        legalAccepted: 'true',
      });
    default:
      return null;
  }
};

const stepOrder: SignUpStep[] = ['basic', 'personal', 'profile'];

const getNextStep = (currentStep: SignUpStep): SignUpStep | null => {
  const idx = stepOrder.indexOf(currentStep);
  return idx < stepOrder.length - 1 ? (stepOrder[idx + 1] ?? null) : null;
};

const getPrevStep = (currentStep: SignUpStep): SignUpStep | null => {
  const idx = stepOrder.indexOf(currentStep);
  return idx > 0 ? (stepOrder[idx - 1] ?? null) : null;
};

const validateStep = (
  currentStep: SignUpStep,
  formValues: SignUpFormData,
  formErrors: Partial<FormErrors>
): boolean => {
  Object.keys(formErrors).forEach((key) => delete formErrors[key as keyof FormErrors]);

  const schema = getValidationSchema(currentStep);
  if (!schema) return false;

  const result = schema(formValues);

  if (result instanceof ArkErrors) {
    for (const error of result) {
      formErrors[error.path[0] as keyof FormErrors] = error.message;
    }
    return false;
  }
  return true;
};

const createSignUpParams = (formValues: SignUpFormData) => ({
  emailAddress: formValues.email,
  password: formValues.newPassword,
  firstName: formValues.firstName,
  lastName: formValues.lastName,
  ...(formValues.username !== undefined && {
    username: formValues.username,
  }),
  legalAccepted: formValues.legalAccepted,
  unsafeMetadata: {
    year: formValues.year,
    grade: formValues.grade,
    joinedAt: formValues.joinedAt,
    getGradeAt: formValues.getGradeAt,
  },
});

const handleClerkSignUp = async (
  clerk: ReturnType<typeof useClerk>,
  formValues: SignUpFormData,
  formErrors: Partial<FormErrors>,
  clerkErrors: ReturnType<typeof ref<ClerkAPIError[]>>,
  isSignUpCreated: ReturnType<typeof ref<boolean>>
): Promise<boolean> => {
  if (!clerk.value?.loaded || isSignUpCreated.value) {
    if (!isSignUpCreated.value) {
      formErrors.general = 'Authentication service is not available';
    }
    return false;
  }

  const fullValidation = formDataSchema(formValues);
  if (fullValidation instanceof ArkErrors) {
    formErrors.general = 'Form is invalid.';
    return false;
  }

  isSignUpCreated.value = true;
  clerkErrors.value = [];
  delete formErrors.general;

  try {
    if (!clerk.value.client) {
      throw new Error('Clerk client not available');
    }
    const signUpParams = createSignUpParams(formValues);

    await clerk.value.client.signUp.create(signUpParams);
    await clerk.value.client.signUp.prepareEmailAddressVerification({
      strategy: 'email_code',
    });

    return true;
  } catch (err: unknown) {
    isSignUpCreated.value = false;
    const errorMsg = 'User registration failed';
    if (err && typeof err === 'object' && 'errors' in err) {
      clerkErrors.value = (err as { errors: ClerkAPIError[] }).errors;
    } else {
      formErrors.general = errorMsg;
    }
    return false;
  }
};

export function useSignUpForm(currentYear: number) {
  const clerk = useClerk();

  const step = ref<SignUpStep>('basic');

  const formValues = reactive<SignUpFormData>({
    email: '',
    newPassword: '',
    firstName: '',
    lastName: '',
    username: undefined,
    year: 'b1',
    grade: 0,
    joinedAt: currentYear,
    getGradeAt: null,
    legalAccepted: false,
  });

  const formErrors = reactive<Partial<FormErrors>>({});
  const clerkErrors = ref<ClerkAPIError[]>([]);
  const isSignUpCreated = ref(false);

  const validateStepFn = (currentStep?: SignUpStep) => {
    return validateStep(currentStep ?? step.value, formValues, formErrors);
  };

  const nextStep = () => {
    const next = getNextStep(step.value);
    if (next) step.value = next;
  };

  const prevStep = () => {
    const prev = getPrevStep(step.value);
    if (prev) step.value = prev;
  };

  const setFormValue = <K extends keyof SignUpFormData>(key: K, value: SignUpFormData[K]) => {
    formValues[key] = value;
    if (key in formErrors) {
      delete formErrors[key as keyof FormErrors];
    }
  };

  const signUp = () => handleClerkSignUp(clerk, formValues, formErrors, clerkErrors, isSignUpCreated);

  return {
    step: readonly(step),
    formValues: readonly(formValues),
    formErrors: readonly(formErrors),
    clerkErrors: readonly(clerkErrors),
    isSignUpCreated: readonly(isSignUpCreated),
    validateStep: validateStepFn,
    nextStep,
    prevStep,
    setFormValue,
    handleClerkSignUp: signUp,
  };
}
