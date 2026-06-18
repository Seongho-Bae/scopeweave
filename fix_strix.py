import sys

def patch_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    out_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        out_lines.append(line)
        if 'for vulnerability_location in "${vulnerability_locations[@]}"; do' in line:
            indent = line.split('for')[0]
            out_lines.append(f'{indent}\tif [ "$vulnerability_location" = "__PR_SCOPE__" ]; then\n')
            out_lines.append(f'{indent}\t\tcontinue\n')
            out_lines.append(f'{indent}\tfi\n')
            out_lines.append(f'{indent}\tif [[ "$vulnerability_location" == /workspace/strix-pr-scope.* ]]; then\n')
            out_lines.append(f'{indent}\t\tcontinue\n')
            out_lines.append(f'{indent}\tfi\n')
        i += 1

    with open(filepath, 'w') as f:
        f.writelines(out_lines)

patch_file('scripts/ci/strix_quick_gate.sh')
