import re

with open("Dockerfile", "r") as f:
    content = f.read()

diff = """<<<<<<< SEARCH
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
=======
EXPOSE 80
USER 1000
CMD ["nginx", "-g", "daemon off;"]
>>>>>>> REPLACE"""

def apply_diff(content, diff):
    blocks = diff.split("<<<<<<< SEARCH\n")[1:]
    for block in blocks:
        search, replace = block.split("\n=======\n")
        replace = replace.split("\n>>>>>>> REPLACE")[0]
        if search not in content:
            print("Failed to find block:\n" + search)
        else:
            content = content.replace(search, replace)
    return content

new_content = apply_diff(content, diff)
with open("Dockerfile", "w") as f:
    f.write(new_content)


with open("infra/k8s/deployment.yaml", "r") as f:
    content2 = f.read()

diff2 = """<<<<<<< SEARCH
      - name: scopeweave
        image: scopeweave:latest
        ports:
        - containerPort: 80
        resources:
=======
      - name: scopeweave
        image: scopeweave:latest
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          capabilities:
            drop: ["ALL"]
        ports:
        - containerPort: 80
        resources:
>>>>>>> REPLACE"""

new_content2 = apply_diff(content2, diff2)
with open("infra/k8s/deployment.yaml", "w") as f:
    f.write(new_content2)
