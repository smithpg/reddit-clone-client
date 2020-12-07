export const capitalize = (originalString: string): string =>
    originalString.charAt(0).toUpperCase() + originalString.slice(1);

export const toTitleCase = (originalString: string): string =>
    originalString.trim().split(' ').map(capitalize).join(' ');
