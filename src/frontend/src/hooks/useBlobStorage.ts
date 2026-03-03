import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useActor } from "./useActor";

export function useBlobStorage() {
  const { actor } = useActor();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<string> => {
      if (!actor) throw new Error("Not connected to backend");

      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      try {
        const config = await loadConfig();
        const agent = await HttpAgent.create({
          host: config.backend_host,
        });

        const storageClient = new StorageClient(
          "default",
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );

        const bytes = new Uint8Array(await file.arrayBuffer());
        const { hash } = await storageClient.putFile(bytes, (progress) => {
          setUploadProgress(progress);
        });

        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setUploadError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [actor],
  );

  const getBlobUrl = useCallback(async (blobId: string): Promise<string> => {
    if (!blobId) return "";
    try {
      const config = await loadConfig();
      const agent = await HttpAgent.create({ host: config.backend_host });
      const storageClient = new StorageClient(
        "default",
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      return storageClient.getDirectURL(blobId);
    } catch {
      return "";
    }
  }, []);

  return { upload, getBlobUrl, uploadProgress, isUploading, uploadError };
}

export function useBlobUrl(blobId: string | null) {
  const { actor } = useActor();
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchUrl = useCallback(async () => {
    if (!blobId || !actor) return;
    setIsLoading(true);
    try {
      const config = await loadConfig();
      const agent = await HttpAgent.create({ host: config.backend_host });
      const storageClient = new StorageClient(
        "default",
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const directUrl = await storageClient.getDirectURL(blobId);
      setUrl(directUrl);
    } catch {
      setUrl("");
    } finally {
      setIsLoading(false);
    }
  }, [blobId, actor]);

  return { url, isLoading, fetchUrl };
}
