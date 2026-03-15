import sys
try:
    from PIL import Image
except ImportError:
    print("Pillow is not installed. Please run 'pip install Pillow' first.")
    sys.exit(1)

def make_transparent(img_path, out_path, tolerance=5):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    for item in data:
        # Check if the pixel is white (or close to white)
        if item[0] > 255 - tolerance and item[1] > 255 - tolerance and item[2] > 255 - tolerance:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    
    # Get bounding box to crop out excessive empty space
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(out_path, "PNG")
    print(f"Successfully saved {out_path}")

if __name__ == '__main__':
    make_transparent(
        r"C:\Users\Viveck Singh-PC\.gemini\antigravity\brain\48a186cd-aac6-435e-88f7-a167fcaee78b\premium_real_estate_logo_1773557243547.png", 
        r"e:\App\avasplot-app\assets\images\new-logo-transparent.png",
        tolerance=5 # tighter tolerance since the AI gave us a very clean white background
    )
