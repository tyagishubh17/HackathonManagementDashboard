import sys

def test(name):
    print(f"Importing {name}...", end="", flush=True)
    if name == "numpy":
        import numpy
    elif name == "rapidfuzz":
        import rapidfuzz
    elif name == "sklearn":
        import sklearn
    elif name == "sklearn.metrics.pairwise":
        import sklearn.metrics.pairwise
    print(" OK", flush=True)

test("numpy")
test("rapidfuzz")
test("sklearn")
test("sklearn.metrics.pairwise")
print("Done!", flush=True)
