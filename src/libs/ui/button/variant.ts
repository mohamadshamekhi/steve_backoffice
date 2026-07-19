const variantClasses = {
    primary: 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300',
    'primary-text':
        'bg-transparent text-brand-500 shadow-theme-xs hover:bg-brand-600 hover:text-white disabled:bg-brand-300',
    outline:
        'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300',
    danger: 'bg-error-600 text-white shadow-theme-xs hover:bg-error-700 disabled:bg-error-300',
    'danger-text':
        'bg-transparent text-error-600 shadow-theme-xs hover:bg-error-700 hover:text-white disabled:bg-error-300',
    success: 'bg-success-500 text-white shadow-theme-xs hover:bg-success-600 disabled:bg-success-300',
    warning: 'bg-warning-500 text-white shadow-theme-xs hover:bg-warning-600 disabled:bg-warning-300',
    secondary: 'bg-gray-500 text-white shadow-theme-xs hover:bg-gray-600 disabled:bg-gray-300'
};

export default variantClasses;
