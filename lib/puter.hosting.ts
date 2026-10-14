import puter from "@heyputer/puter.js";
import {
    createHostingSlug,
    fetchBlobFromUrl, getHostedUrl,
    getImageExtension,
    HOSTING_CONFIG_KEY,
    imageUrlToPngBlob,
    isHostedUrl
} from "./utils";

const PUBLIC_HOST_DIR = "roomify/public";
const PRIVATE_PROJECTS_DIR = "roomify/private/projects";

export const getOrCreateHostingConfig = async (): Promise<HostingConfig | null> => {
    const existing = (await puter.kv.get(HOSTING_CONFIG_KEY)) as HostingConfig | null;

    const subdomain = existing?.subdomain ?? createHostingSlug();

    try {
        await puter.fs.mkdir(PUBLIC_HOST_DIR, { createMissingParents: true });

        const pointHostAtPublicDir = puter.hosting.update as (
            subdomain: string,
            dirPath: string,
        ) => Promise<{ subdomain: string }>;

        const site = existing?.subdomain
            ? await pointHostAtPublicDir(existing.subdomain, PUBLIC_HOST_DIR)
            : await puter.hosting.create(subdomain, PUBLIC_HOST_DIR);

        if(!existing?.subdomain) {
            await puter.kv.set(HOSTING_CONFIG_KEY, { subdomain: site.subdomain });
        }

        return { subdomain: site.subdomain };
    } catch (e) {
        console.warn(`Could not find subdomain: ${e}`);
        return null;
    }
}

export const uploadImageToHosting = async ({ hosting, url, projectId, label, visibility = "private" }: StoreHostedImageParams): Promise<HostedAsset | null> => {
    if(!hosting || !url) return null;
    if(visibility === "public" && isHostedUrl(url)) return { url };

    try {
        const resolved = label === "rendered"
            ? await imageUrlToPngBlob(url)
                .then((blob) => blob ? { blob, contentType: 'image/png' }: null)
            : await fetchBlobFromUrl(url);

        if(!resolved) return null;

        const contentType = resolved.contentType || resolved.blob.type || '';
        const ext = getImageExtension(contentType, url);
        const isPublic = visibility === "public";
        const dir = isPublic
            ? `${PUBLIC_HOST_DIR}/projects/${projectId}`
            : `${PRIVATE_PROJECTS_DIR}/${projectId}`;
        const filePath = `${dir}/${label}.${ext}`;

        const uploadFile = new File([resolved.blob], `${label}.${ext}`, {
            type: contentType,
        });

        await puter.fs.mkdir(dir, { createMissingParents: true });
        await puter.fs.write(filePath, uploadFile);

        if(!isPublic) {
            const readUrl = await puter.fs.getReadURL(filePath);
            return readUrl ? { url: readUrl } : null;
        }

        const hostedUrl = getHostedUrl(
            { subdomain: hosting.subdomain },
            `projects/${projectId}/${label}.${ext}`,
        );

        return hostedUrl ? { url: hostedUrl } : null;
    } catch (e) {
        console.warn(`Failed to store hosted image: ${e}`);
        return null;
    }
}