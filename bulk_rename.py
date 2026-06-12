import re
import os

files_to_patch = [
    'src/views/Dashboard.svelte',
    'src/views/History.svelte',
    'src/views/Room.svelte',
    'src/views/Shop.svelte'
]

for file_path in files_to_patch:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update imports
    content = content.replace(' products,', ' getProducts,')
    content = content.replace(' products }', ' getProducts }')

    # 2. Update usages
    content = content.replace('products.find', 'getProducts().find')
    content = content.replace('products.length', 'getProducts().length')
    content = content.replace('products.filter', 'getProducts().filter')
    content = content.replace('{#each products as', '{#each getProducts() as')
    
    # Shop.svelte specific: let filteredProducts = $derived(products... -> getProducts()
    content = content.replace('$derived(products', '$derived(getProducts()')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# Update store.svelte.ts
store_path = 'src/lib/store.svelte.ts'
with open(store_path, 'r', encoding='utf-8') as f:
    store_content = f.read()

store_content = store_content.replace(
    'export const products = $derived(getLocalizedProducts(i18nState.locale));',
    'export const getProducts = () => getLocalizedProducts(i18nState.locale);'
)

# Also update any internal usages in store.svelte.ts
store_content = store_content.replace('products.find', 'getProducts().find')

with open(store_path, 'w', encoding='utf-8') as f:
    f.write(store_content)

print('Bulk renaming complete.')
