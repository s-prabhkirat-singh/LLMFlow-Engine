const TEMPLATE_REGEX = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g;

const getPathValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }

    return undefined;
  }, obj);
};

export const renderTemplate = (
  template: string,
  context: Record<string, unknown>
): string => {
  return template.replace(TEMPLATE_REGEX, (_match, key: string) => {
    const value = getPathValue(context, key);
    if (value === undefined || value === null) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    return JSON.stringify(value);
  });
};
