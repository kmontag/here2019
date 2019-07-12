OPENSCAD_BIN = /Applications/OpenSCAD.app/Contents/MacOS/OpenScad
SCAD_FILES = $(wildcard [a-zA-Z]*.scad)
STL_FILES = $(patsubst %.scad,build/%.stl,$(SCAD_FILES))

default: all

.PHONY: all
all: $(STL_FILES)

build/%.stl: %.scad
	mkdir -p build/
	$(OPENSCAD_BIN) -o $@ $<

.PHONY: clean
clean:
	rm -rf build/