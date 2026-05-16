import { AppOptions } from '../../app/types';
import { AuthOptions } from '../../auth/types';

export class AppConfig {
  public appOptions = new AppOptions();
  public authOptions = new AuthOptions();
}
