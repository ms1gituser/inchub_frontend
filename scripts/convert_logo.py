import os
import fitz  # PyMuPDF

def main():
    ai_path = r"c:\Users\Dhairya\Desktop\clients\mahesh\CRM_Frontend\public\inchub-logo.ai"
    output_dir = r"c:\Users\Dhairya\Desktop\clients\mahesh\CRM_Frontend\public"

    print(f"Loading AI file from: {ai_path}")
    if not os.path.exists(ai_path):
        print("Error: AI file not found!")
        return

    try:
        doc = fitz.open(ai_path)
        print(f"Document successfully loaded. Page count: {len(doc)}")
        
        for i in range(len(doc)):
            page = doc[i]
            rect = page.rect
            print(f"Page {i+1} dimensions: {rect.width}x{rect.height} pt")

            # Extract to SVG
            svg_path = os.path.join(output_dir, f"logo_page_{i+1}.svg")
            svg_content = page.get_svg_image()
            with open(svg_path, "w", encoding="utf-8") as f:
                f.write(svg_content)
            print(f"  Page {i+1} SVG written successfully.")

            # Extract to PNG (300 DPI for high quality)
            png_path = os.path.join(output_dir, f"logo_page_{i+1}.png")
            zoom = 300 / 72
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=True)
            pix.save(png_path)
            print(f"  Page {i+1} PNG written successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
