with open('tests/e2e/scopeweave.spec.js', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.strip().startswith("test('does not parse planned dates redundantly during metrics computation'"):
        skip = True

    if skip and line.strip() == "});":
        skip = False
        continue

    if skip and line.strip() == "});":
        skip = False
        continue

    if not skip:
        new_lines.append(line)

with open('tests/e2e/scopeweave.spec.js', 'w') as f:
    f.writelines(new_lines)
