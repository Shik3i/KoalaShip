import re

# 1. Fix catalog.ts escaping issues
catalog_path = 'src/lib/catalog.ts'
with open(catalog_path, 'r', encoding='utf-8') as f:
    catalog_content = f.read()

# The error showed "I\\\\'ll", let's just do a broad replacement of multiple slashes
catalog_content = catalog_content.replace("\\\\'", "'")
catalog_content = catalog_content.replace("\\'", "'")
# If it's single quoted, we can't just replace \' with ', so let's change those specific strings to double quotes or escape properly.
# Actually, the error `I\\'ll` means it's `'Good value for money. I\\'ll take two.'` 
# Let's fix the specific instances.
catalog_content = catalog_content.replace("'Good value for money. I\\'ll take two.'", '"Good value for money. I\'ll take two."')
catalog_content = catalog_content.replace("'It\\'s basically just an overpriced board with glass.'", '"It\'s basically just an overpriced board with glass."')
catalog_content = catalog_content.replace("'Looks fast, that\\'s enough for me.'", '"Looks fast, that\'s enough for me."')
catalog_content = catalog_content.replace("'A mysterious golden box. Nobody knows what\\'s inside (Spoiler: some other product).'", '"A mysterious golden box. Nobody knows what\'s inside (Spoiler: some other product)."')

# Re-read and replace any remaining \' with ' and wrap in double quotes
# But let's just do it simple:
catalog_content = catalog_content.replace("I\\\\'ll", "I'll")
catalog_content = catalog_content.replace("It\\\\'s", "It's")
catalog_content = catalog_content.replace("that\\\\'s", "that's")
catalog_content = catalog_content.replace("what\\\\'s", "what's")

catalog_content = catalog_content.replace("I\\'ll", "I'll")
catalog_content = catalog_content.replace("It\\'s", "It's")
catalog_content = catalog_content.replace("that\\'s", "that's")
catalog_content = catalog_content.replace("what\\'s", "what's")

# Wait, if they are surrounded by single quotes, putting an unescaped single quote breaks it again.
# Let's use regex to find single-quoted strings containing apostrophes and change them to double quotes.
def replace_quotes(match):
    s = match.group(0)
    # Remove outer single quotes
    s = s[1:-1]
    # Remove slashes
    s = s.replace("\\'", "'")
    s = s.replace('\\\\', '')
    return f'"{s}"'

catalog_content = re.sub(r"'[^']*?(?:I\\'ll|It\\'s|that\\'s|what\\'s)[^']*?'", replace_quotes, catalog_content)
catalog_content = re.sub(r"'[^']*?(?:I\\\\'ll|It\\\\'s|that\\\\'s|what\\\\'s)[^']*?'", replace_quotes, catalog_content)

with open(catalog_path, 'w', encoding='utf-8') as f:
    f.write(catalog_content)


# 2. Fix Shop.svelte syntax error
shop_path = 'src/views/Shop.svelte'
with open(shop_path, 'r', encoding='utf-8') as f:
    shop_content = f.read()

shop_content = shop_content.replace(
    "addToCart(product.id, product.variants?.[0]?.values[0] ?? 'Standard')",
    "addToCart(product.id, product.variants?.[0]?.values[0]?.name ?? 'Standard')"
)

with open(shop_path, 'w', encoding='utf-8') as f:
    f.write(shop_content)

print("Errors fixed.")
