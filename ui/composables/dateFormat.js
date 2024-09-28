import { useSettingsStore } from '~/stores/settingsStore';

export function useDateFormatter() {
    const settingsStore = useSettingsStore();
    let dateFormat = settingsStore.getSettingByKey('default_date_format') || 'DD/MM/YYYY';

    // Function to initialize the date format
    const initDateFormat = async () => {
        dateFormat = settingsStore.getSettingByKey('default_date_format') || 'DD/MM/YYYY';
    };

    // The actual formatting function
    const formatDate = (value) => {
        if (!value) return '';

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            console.error('Invalid date');
            return 'Invalid Date';
        }

        console.log('dateFormat', dateFormat);

        const dateParts = {
            YYYY: date.getFullYear(),
            YY: String(date.getFullYear()).slice(-2),
            MM: String(date.getMonth() + 1).padStart(2, '0'),
            DD: String(date.getDate()).padStart(2, '0'),
            M: String(date.getMonth() + 1),
            D: String(date.getDate())
        };

        const formatMap = {
            'DD/MM/YYYY': `${dateParts.DD}/${dateParts.MM}/${dateParts.YYYY}`,
            'MM/DD/YYYY': `${dateParts.MM}/${dateParts.DD}/${dateParts.YYYY}`,
            'YYYY-MM-DD': `${dateParts.YYYY}-${dateParts.MM}-${dateParts.DD}`,
            'YYYY/MM/DD': `${dateParts.YYYY}/${dateParts.MM}/${dateParts.DD}`,
            'DD-MM-YYYY': `${dateParts.DD}-${dateParts.MM}-${dateParts.YYYY}`,
            'MM-DD-YYYY': `${dateParts.MM}-${dateParts.DD}-${dateParts.YYYY}`,
            'YYYY.MM.DD': `${dateParts.YYYY}.${dateParts.MM}.${dateParts.DD}`,
            'DD.MM.YYYY': `${dateParts.DD}.${dateParts.MM}.${dateParts.YYYY}`,
            'MM.DD.YYYY': `${dateParts.MM}.${dateParts.DD}.${dateParts.YYYY}`
        };

        return formatMap[dateFormat] || 'Invalid Format';
    };

    return {
        initDateFormat,
        formatDate
    };
}
