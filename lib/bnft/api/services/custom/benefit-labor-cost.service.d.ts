/**
 * 專案名稱： @wistroni40/bnft
 * 部門代號： ML8100
 * 檔案說明： 效益DL及IDL人員工時服務
 * @CREATE Mon Feb 08 2021 上午8:36:35
 * @author Steve Y Lin
 * @contact Steve_Y_Lin@wistron.com #1342
 * -----------------------------------------------------------------------------
 * @NOTE
 */
import { Observable } from 'rxjs';
import { HttpAdapter, HttpResponse } from '../../../../http';
import { BenefitLatestLaborCostResponse } from '../../models';
import { BenefitLaborCost } from '../core';
/**
 * 效益DL及IDL人員工時服務
 */
export declare class BenefitLaborCostService implements BenefitLaborCost {
    protected http: HttpAdapter;
    /**
     * @param http HTTP請求轉接器
     */
    constructor(http: HttpAdapter);
    /**
     * 取得最新的IDL或ID人員工時
     *
     * @method public
     * @param site      Site
     * @param plantCode 廠別代碼
     * @param laborType 人員類別(IDL or DL)
     * @return 回傳最新的IDL或ID人員工時
     */
    getLatestCost(site: string, plantCode: string, laborType: 'idl' | 'dl'): Observable<HttpResponse<BenefitLatestLaborCostResponse>>;
}
