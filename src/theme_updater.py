import os

def replace_colors(directory):
    replacements = {
        '#7B61FF': '#8B5CF6', # New primary lavender
        '#7405CB': '#7C3AED', # New deep purple
        '#5A45D1': '#6D28D9', # Balanced deep purple
        '#4532B0': '#4C1D95', # Very deep purple
    }
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    for old, new in replacements.items():
                        new_content = new_content.replace(old, new)
                        new_content = new_content.replace(old.lower(), new)
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated colors in {path}")
                except Exception as e:
                    print(f"Error in {path}: {e}")

replace_colors(r'c:\dev\Leadito\Frontend\leadito\src')
