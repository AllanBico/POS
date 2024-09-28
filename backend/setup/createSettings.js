const Setting = require('../models/setting');

const defaultSettings = [
    {
        category: 'General',
        key: 'default_currency',
        value: JSON.stringify({ code: 'USD', symbol: '$' }),
        description: 'Default currency used in the system',
    },
    {
        category: 'General',
        key: 'default_tax_rate',
        value: JSON.stringify({ rate: 10, type: 'percentage' }),
        description: 'Default tax rate used in the system',
    },
    {
        category: 'General',
        key: 'company_name',
        value: JSON.stringify('Your Company Name'),
        description: 'Default company name used in reports and invoices',
    },
    {
        category: 'General',
        key: 'company_email',
        value: JSON.stringify('info@example.com'),
        description: 'Default company email used in reports and invoices',
    },
    {
        category: 'General',
        key: 'company_phone',
        value: JSON.stringify('0700000000'),
        description: 'Default company phone number used in reports and invoices',
    },
    {
        category: 'General',
        key: 'default_language',
        value: JSON.stringify('en'),
        description: 'Default language used in the system',
    },
    {
        category: 'General',
        key: 'default_timezone',
        value: JSON.stringify('America/New_York'),
        description: 'Default timezone used in the system',
    },
    {
        category: 'General',
        key: 'default_date_format',
        value: JSON.stringify('YYYY-MM-DD'),
        description: 'Default date format used in the system',
    },
    {
        category: 'General',
        key: 'default_time_format',
        value: JSON.stringify('HH:mm'),
        description: 'Default time format used in the system',
    },
    {
        category: 'General',
        key: 'default_decimal_separator',
        value: JSON.stringify('.'),
        description: 'Default decimal separator used in the system',
    },
    {
        category: 'General',
        key: 'default_thousand_separator',
        value: JSON.stringify(','),
        description: 'Default thousand separator used in the system',
    },
    {
        category: 'Inventory',
        key: 'low_stock_threshold',
        value: JSON.stringify(5),
        description: 'Threshold for low stock notifications',
    },
    {
        category: 'Inventory',
        key: 'allow_negative_stock',
        value: JSON.stringify(false),
        description: 'Allow stock levels to go below zero',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_template',
        value: JSON.stringify('default'),
        description: 'Default invoice template used',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_footer',
        value: JSON.stringify('Thank you for your business!'),
        description: 'Default footer message used in invoices',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_terms',
        value: JSON.stringify('Net 30 days'),
        description: 'Default terms used in invoices',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_tax_rate',
        value: JSON.stringify({ rate: 10, type: 'percentage' }),
        description: 'Default tax rate used in invoices',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_discount',
        value: JSON.stringify({ rate: 0, type: 'percentage' }),
        description: 'Default discount used in invoices',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_logo',
        value: JSON.stringify(''),
        description: 'Default logo used in invoices',
    },
    {
        category: 'POS',
        key: 'default_pos_template',
        value: JSON.stringify('default'),
        description: 'Default POS template used',
    },
    {
        category: 'POS',
        key: 'default_pos_footer',
        value: JSON.stringify('Thank you for shopping with us!'),
        description: 'Default footer message used in receipts',
    },
    {
        category: 'POS',
        key: 'default_pos_tax_rate',
        value: JSON.stringify({ rate: 10, type: 'percentage' }),
        description: 'Default tax rate used in POS',
    },
    {
        category: 'POS',
        key: 'default_pos_discount',
        value: JSON.stringify({ rate: 0, type: 'percentage' }),
        description: 'Default discount used in POS',
    },
];

async function seedDefaultSettings() {
    try {
        // Use bulkCreate to insert multiple settings at once
        await Setting.bulkCreate(defaultSettings, {
            ignoreDuplicates: true,  // Ignore if the setting already exists
        });
        console.log('Default settings have been successfully inserted');
    } catch (error) {
        console.error('Error inserting default settings:', error);
    }
}
seedDefaultSettings();
module.exports = seedDefaultSettings;