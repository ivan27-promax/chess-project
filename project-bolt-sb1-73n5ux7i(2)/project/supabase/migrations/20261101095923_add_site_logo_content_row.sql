/*
# Add club logo setting to home page content

1. New Rows
- site_content row "site_logo": stores the web address (https) of the club logo image in the English value. An empty value means the default crown icon is shown.

2. Security
- No table, policy or grant changes. Visitors can already read site_content and admins can already update it.

3. Notes
- Uses ON CONFLICT so re-running this migration never overwrites an existing logo choice.
*/

INSERT INTO site_content (key, value_en, value_ar)
VALUES ('site_logo', '', '')
ON CONFLICT (key) DO NOTHING;
