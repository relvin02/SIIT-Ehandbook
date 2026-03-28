from PIL import Image

# Open the original logo
logo = Image.open('siitlogo.png').convert('RGBA')

# For FOREGROUND IMAGE (Android adaptive icon):
# Extract just the shield/torch part (center), make it smaller to fit safe zone
# Resize logo to 1024x1024 first
logo_1024 = logo.resize((1024, 1024), Image.Resampling.LANCZOS)

# Create foreground: just the center shield on transparent background
foreground = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))

# Resize the shield to 55% (smaller to avoid edge cutoff on safe zone)
shield = logo_1024.resize((550, 550), Image.Resampling.LANCZOS)
pos = (1024 - 550) // 2
foreground.paste(shield, (pos, pos), shield)

# Save foreground
foreground.save('frontend/assets/adaptive-icon.png', 'PNG')

# For REGULAR ICON (iPhone and app drawer on older Android):
# Just the full logo resized to 1024x1024
full_icon = Image.new('RGBA', (1024, 1024), (255, 255, 255, 255))
logo_resize = logo.resize((950, 950), Image.Resampling.LANCZOS)
pos_full = (1024 - 950) // 2
full_icon.paste(logo_resize, (pos_full, pos_full), logo_resize)
full_icon.convert('RGB').save('frontend/assets/icon.png', 'PNG')

print("✓ Adjusted adaptive icon - smaller shield to avoid edge cutoff")
print("✓ Shield now 55% (was 70%) for better safe zone fit")
