import { Inject } from '@gulux/gulux';
import { Controller, Files, Post, Res, type HTTPResponse } from '@gulux/gulux/application-http';
import AssetService from '../services/assetService';
import { normalizeUploadedFiles } from '../utils/normalizeUploadedFiles';

@Controller({ path: '/assets' })
export default class AssetController {
  @Inject()
  private readonly assetService!: AssetService;

  @Post('/upload')
  public uploadAssets(@Files('files') files: unknown, @Res() res: HTTPResponse) {
    const uploadedFiles = normalizeUploadedFiles(files);
    const assets = this.assetService.createAssetsFromUploadedFiles(uploadedFiles);
    res.status = 201;
    return {
      items: assets,
    };
  }
}
