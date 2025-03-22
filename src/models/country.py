import json

class Country:
    def __init__(self, alpha_2 : str) -> None:
        with open('./data/codigos_paises.json', 'r', encoding='utf-8') as file:
            paises = json.load(file)
            country = next((p for p in paises if p["alpha_2"] == alpha_2), None)
            self.code = country['code']
            self.alpha_2 = country['alpha_2']
            self.alpha_3 = country['alpha_3']
            self.name_pt = country['name_pt']
            self.name_en = country['name_en']
            
    def __str__(self):
        return "Country(alpha_2: " + self.alpha_2 + ")"
    
    def __repr__(self):
        return "Country(code: " + self.code + ", alpha_2: " + self.alpha_2 + ", alpha_3: " + self.alpha_3 + ", name_pt: " + self.name_pt + ", name_en: " + self.name_en + ")"
    
    def to_dict(self):
        return {
            "code": self.code,
            "alpha_2": self.alpha_2,
            "alpha_3": self.alpha_3,
            "name_pt": self.name_pt,
            "name_en": self.name_en
        }
    
    def from_dict(self, data : dict):
        self.code = data['code']
        self.alpha_2 = data['alpha_2']
        self.alpha_3 = data['alpha_3']
        self.name_pt = data['name_pt']
        self.name_en = data['name_en']
        
    def __eq__(self, other):
        return self.code == other.code
    
    def __hash__(self):
        return hash(self.code)
    
