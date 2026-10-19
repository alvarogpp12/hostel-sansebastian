import { describe, expect, it } from "vitest";
import { cleanText, htmlToText } from "./text";

describe("htmlToText", () => {
  it("convierte los párrafos de las políticas de Redforts en texto con saltos de línea", () => {
    const html =
      "<p>Si cancelas o modificas la reserva, o si no te presentas, el cargo será el precio total de la reserva.</p>\n<p>Sin embargo, puedes cambiar las fechas una vez.</p>\n\n<p>El precio total de la reserva se cobra en el momento de reservar.</p>";
    expect(htmlToText(html)).toBe(
      "Si cancelas o modificas la reserva, o si no te presentas, el cargo será el precio total de la reserva.\n\nSin embargo, puedes cambiar las fechas una vez.\n\nEl precio total de la reserva se cobra en el momento de reservar.",
    );
  });

  it("br, listas, negritas y entidades", () => {
    expect(htmlToText("Entrada<br/>desde las 14:00 &amp; salida <strong>antes</strong> de las 11&nbsp;h")).toBe(
      "Entrada\ndesde las 14:00 & salida antes de las 11 h",
    );
    expect(htmlToText("<ul><li>Wifi</li><li>Toallas</li></ul>")).toBe("• Wifi\n• Toallas");
    expect(htmlToText("Pol&iacute;tica de cancelaci&oacute;n &#8364; &#x2014;")).toBe("Política de cancelación € —");
  });

  it("no toca el texto plano y elimina scripts", () => {
    expect(htmlToText("Cancelación gratuita hasta 48 h antes.")).toBe("Cancelación gratuita hasta 48 h antes.");
    expect(htmlToText('<p>Hola</p><script>alert("x")</script>')).toBe("Hola");
  });

  it("cleanText devuelve null si no queda nada", () => {
    expect(cleanText("<p> </p>")).toBeNull();
    expect(cleanText(null)).toBeNull();
  });
});
