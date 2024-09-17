const Setting = require('../models/setting');

const defaultSettings = [
    {
        category: 'General',
        key: 'default_currency',
        value: JSON.stringify({ code: 'USD', symbol: '$' }),
        description: 'The default currency for transactions',
    },
    {
        category: 'General',
        key: 'default_tax_rate',
        value: JSON.stringify({ rate: 10, type: 'percentage' }), // 10% default tax rate
        description: 'The default tax rate applied to transactions',
    },
    {
        category: 'General',
        key: 'company_name',
        value: JSON.stringify('Your Company Name'),
        description: 'The default company name for display in reports and invoices',
    },
    {
        category: 'General',
        key: 'default_language',
        value: JSON.stringify('en'),
        description: 'The default language of the system',
    },
    {
        category: 'Inventory',
        key: 'low_stock_threshold',
        value: JSON.stringify(5),  // Notify when stock reaches 5 units
        description: 'Threshold for low stock notifications',
    },
    {
        category: 'Inventory',
        key: 'allow_negative_stock',
        value: JSON.stringify(false), // Prevent negative stock levels
        description: 'Allow stock levels to go below zero',
    },
    {
        category: 'POS',
        key: 'default_receipt_footer',
        value: JSON.stringify('Thank you for shopping with us!'),
        description: 'Default message printed on receipt footers',
    },
    {
        category: 'POS',
        key: 'enable_discounts',
        value: JSON.stringify(true),
        description: 'Whether discounts are enabled in the POS system',
    },
    {
        category: 'POS',
        key: 'enable_taxes',
        value: JSON.stringify(true),
        description: 'Whether taxes are enabled in the POS system',
    },
    {
        category: 'General',
        key: 'default_timezone',
        value: JSON.stringify('America/New_York'),
        description: 'The default timezone used in the system',
    },
    {
        category: 'General',
        key: 'default_date_format',
        value: JSON.stringify('YYYY-MM-DD'),
        description: 'The default date format used in the system',
    },
    {
        category: 'General',
        key: 'default_time_format',
        value: JSON.stringify('HH:mm'),
        description: 'The default time format used in the system',
    },
    {
        category: 'General',
        key: 'default_decimal_separator',
        value: JSON.stringify('.'),
        description: 'The default decimal separator used in the system',
    },
    {
        category: 'General',
        key: 'default_thousand_separator',
        value: JSON.stringify(','),
        description: 'The default thousand separator used in the system',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_template',
        value: JSON.stringify('default'),
        description: 'The default invoice template used',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_footer',
        value: JSON.stringify('Thank you for your business!'),
        description: 'The default footer message used in invoices',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_terms',
        value: JSON.stringify('Net 30 days'),
        description: 'The default terms used in invoices',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_tax_rate',
        value: JSON.stringify({ rate: 10, type: 'percentage' }),
        description: 'The default tax rate used in invoices',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_discount',
        value: JSON.stringify({ rate: 0, type: 'percentage' }),
        description: 'The default discount used in invoices',
    },
    {
        category: 'Invoice',
        key: 'default_invoice_logo',
        value: JSON.stringify(''),
        description: 'The default logo used in invoices',
    },
    {
        category: 'POS',
        key: 'default_pos_template',
        value: JSON.stringify('default'),
        description: 'The default POS template used',
    },
    {
        category: 'POS',
        key: 'default_pos_footer',
        value: JSON.stringify('Thank you for shopping with us!'),
        description: 'The default footer message used in receipts',
    },
    {
        category: 'POS',
        key: 'default_pos_tax_rate',
        value: JSON.stringify({ rate: 10, type: 'percentage' }),
        description: 'The default tax rate used in POS',
    },
    {
        category: 'POS',
        key: 'default_pos_discount',
        value: JSON.stringify({ rate: 0, type: 'percentage' }),
        description: 'The default discount used in POS',
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