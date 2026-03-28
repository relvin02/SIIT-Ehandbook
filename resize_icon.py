from PIL import Image

# Open the logo
logo = Image.open('siitlogo.png').convert('RGBA')

# Create 1024x1024 canvas with white background
canvas = Image.new('RGBA', (1024, 1024), (255, 255, 255, 255))

# Calculate position to center the logo
logo_resized = logo.resize((900, 900), Image.Resampling.LANCZOS)
x = (1024 - 900) // 2
y = (1024 - 900) // 2

# Paste logo onto canvas
canvas.paste(logo_resized, (x, y), logo_resized)

# Save as icon
canvas.convert('RGB').save('frontend/assets/icon.png', 'PNG', quality=95)
canvas.convert('RGB').save('frontend/assets/adaptive-icon.png', 'PNG', quality=95)

print("✓ Icon resized to 1024x1024px and saved!")
