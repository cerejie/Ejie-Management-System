export const bp = { mobile: 767, tablet: 991 };

export const mobileDown = `screen and (max-width: ${bp.mobile}px)`;
export const tabletUp = `screen and (min-width: ${bp.mobile + 1}px)`;
export const tabletDown = `screen and (max-width: ${bp.tablet}px)`;
