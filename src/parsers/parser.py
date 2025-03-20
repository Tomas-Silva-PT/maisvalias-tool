from abc import ABC, abstractmethod
class IParser(ABC):
    @abstractmethod
    def parse(self, data):
        """Deve ser implementado por cada broker específico"""
        pass