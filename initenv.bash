rm -r .nodevenv .venv
pipx run nodeenv -n lts .nodevenv
npx -y npm@8 install
npm install
