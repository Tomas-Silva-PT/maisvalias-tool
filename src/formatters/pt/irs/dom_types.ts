export type XMLDoc =
  | Document                // Browser
  | import("@xmldom/xmldom").Document; // Node