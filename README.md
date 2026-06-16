# Vozinha já ultrapassou Neymar?

Site estático para GitHub Pages com atualização automática via GitHub Actions.

## Esta é a v3

A v2 usava `instaloader`, mas ele pode bater em `429 Too Many Requests` e ficar esperando 30 minutos.

Esta v3 **não usa instaloader**. Ela:

1. tenta ler dados públicos espelhados pelo Imginn;
2. tenta o HTML público do Instagram;
3. se falhar, mantém o último valor salvo em `data.json`.

Ou seja: não trava, não inventa número, e não fica esperando meia hora.

## Rodar localmente

```bash
pip install -r requirements.txt
python scripts/fetch_instagram_counts.py
```

## Publicar no GitHub Pages

1. Crie um repositório.
2. Suba todos os arquivos.
3. Vá em **Settings → Pages**.
4. Source: **Deploy from a branch**.
5. Branch: **main**.
6. Folder: **/root**.

## Atualização automática

O GitHub Action roda a cada 30 minutos:

`.github/workflows/update-counts.yml`

## Perfis usados

- Vozinha: https://www.instagram.com/Vozinha1/
- Neymar: https://www.instagram.com/neymarjr/

## Aviso honesto

Instagram é ruim para esse tipo de coisa. O ideal profissional seria usar uma API paga/terceirizada de social stats. Para meme rápido, essa v3 é mais viável porque evita o bloqueio agressivo do `instaloader`.
