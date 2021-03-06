/**
 * 專案名稱： @wistroni40/bnft
 * 部門代號： ML8100
 * 檔案說明： 效益使用範例
 * @CREATE Fri Feb 05 2021 下午1:14:17
 * @author Steve Y Lin
 * @contact Steve_Y_Lin@wistron.com #1342
 * -----------------------------------------------------------------------------
 * @NOTE
 */

import {
  BenefitConfigModel,
  BenefitQueryModel,
  Bnft,
  BnftTemplate
} from '../src';

/**
 * -----------------------------------------------------------------------------
 * Custom Benefit
 * -----------------------------------------------------------------------------
 */

/**
 * 效益使用範例
 */
class Benefit extends BnftTemplate {
  /**
   * 需要計算的廠別，若設為undefined則表示所有廠別都要計算
   */
  protected enabledPlant = ['plantA'];

  /**
   * @param config 效益設定檔
   */
  constructor(public config: BenefitConfigModel) {
    super(config);
  }

  /**
   * 取得效益參數
   *
   * @method public
   * @param condition 效益查詢條件
   * @return 回傳效益參數
   */
  public async getBenefitParams(
    condition: BenefitQueryModel,
  ): Promise<Bnft.Param[]> {
    const { site, plantCode } = condition;
    const idlCost = await this.findLatestLaborCost(
      site,
      plantCode,
      'idl',
    ).toPromise();

    const analysisParams: Bnft.Param = {
      name: 'time_analysis',
      value: 2,
      type: 'CONST',
    };

    const idlCostParams: Bnft.Param = {
      name: 'idl_pay_hr',
      value: idlCost ? idlCost.cost : 0,
      type: 'VAR',
    };

    return [analysisParams, idlCostParams];
  }
}

/**
 * -----------------------------------------------------------------------------
 * Configuration
 * -----------------------------------------------------------------------------
 */

const configuration: BenefitConfigModel = {
  systemId: 'system_id',
  typeId: 'type_id',
  benefitType: 'direct',
  publishApi: 'http://publish-api-url/',
  benefitApi: 'http://benefit-api-url/',
  retry: 3,
  retryInterval: 1000,
};

/**
 * -----------------------------------------------------------------------------
 * Benefit
 * -----------------------------------------------------------------------------
 */

const benefit = new Benefit(configuration);

// 設定排程定時拋送
benefit.setSchedule('0 0 0 * * ? *');

// 直接拋送
benefit.execute();

// 監聽拋送結果
benefit.sendCompleted.subscribe(res => {
  if (res.error) {
    // TODO
  } else {
    // TODO
  }
});
