# wistroni40-bnft

# Install

```
npm i wistroni40-bnft --save
```

# Table of Contents

- [Quickstart](#quickstart)
- [Feature](#feature)
- [API](#api)
  - [BnftTemplate](#BnftTemplate)
  - [BenefitConfigModel](#BenefitConfigModel)
- [Resend API Usage](#resend-api-usage)

# Quickstart

> 繼承效益範本，實作`getBenefitParams`方法

benefit.ts

```typescript
import { BnftTemplate } from 'wistroni40-bnft';

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
```

> 實例效益，使用`setSchedule`設定計算排成；或使用`execute`直接拋送效益

index.ts

```typescript
import { Benefit, BenefitConfigModel } from 'wistroni40-bnft';

// 效益設定
const configuration: BenefitConfigModel = {
  systemId: 'system_id',
  typeId: 'type_id',
  benefitType: 'direct',
  publishApi: 'http://publish-api-url/',
  benefitApi: 'http://benefit-api-url/',
  retry: 3,
};

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
```

[Full Example](https://github.com/SteveLin100132/wistroni40-bnft/blob/master/examples/benefit.ts)

# Feature

- 提供效益計算實作範本
- 效益上拋具備重拋及保存機制
- 範本中埋入 API，可執行重新計算

# API

## **_BnftTemplate_**

**_Abstract Class_**，效益範本

### constructor

BnftTemplate 的建構值

| Parameter |        Type        | Required |   Default   | Description                                                       |
| :-------- | :----------------: | :------: | :---------: | :---------------------------------------------------------------- |
| config    | BenefitConfigModel | Required | `undefined` | 效益配置，配置說明可參考[BenefitConfigModel](#BenefitConfigModel) |

Example:

```typescript
const config = {
  systemId: 'mytest',
  typeId: 'cost_idl',
  benefitType: 'direct',
  publishApi: 'http://publish-api-url/',
  benefitApi: 'http://benefit-api-url/',
  retry: 3,
};
```

### Properties

#### config

|        Type        | Required |   Default   | Description |
| :----------------: | :------: | :---------: | :---------- |
| BenefitConfigModel | Required | `undefined` | 效益設定檔  |

### Methods

#### setSchedule

設定效益計算排程

| Parameter |     Type     | Required |   Default   | Description  |
| :-------- | :----------: | :------: | :---------: | :----------- |
| cron      |    string    | Required | `undefined` | 排程         |
| returns   | BnftTemplate | Required | `undefined` | 回傳物件本身 |

#### getBenefitParams

取得效益參數

| Parameter |            Type             | Required |   Default   | Description                                                           |
| :-------- | :-------------------------: | :------: | :---------: | :-------------------------------------------------------------------- |
| condition |      BenefitQueryModel      | Required | `undefined` | 效益查詢條件，配置說明可參考[BenefitConfigModel](#BenefitConfigModel) |
| returns   | Promise&lt;Bnft.Param[]&gt; | Required | `undefined` | 回傳效益參數                                                          |

#### processBenefitParams

處理效益參數

| Parameter |                              Type                               | Required |   Default   | Description        |
| :-------- | :-------------------------------------------------------------: | :------: | :---------: | :----------------- |
| response  |   Observable&lt;HttpResponse&lt;ActivedSystemModel[]&gt;&gt;    | Required | `undefined` | 查詢激活的效益系統 |
| timestamp |                              Date                               | Optional | `undefined` | 查詢開始時間       |
| returns   | Observable&lt;ProducePayloadModel&lt;Bnft.BenefitSaving&gt;&gt; | Required | `undefined` | 回傳處理後效益參數 |

#### execute

執行效益參數撈取

| Parameter |                              Type                               | Required |   Default   | Description          |
| :-------- | :-------------------------------------------------------------: | :------: | :---------: | :------------------- |
| timestamp |                              Date                               | Optional | `undefined` | 查詢開始時間         |
| returns   | Observable&lt;ProducePayloadModel&lt;Bnft.BenefitSaving&gt;&gt; | Required | `undefined` | 回傳效益參數上拋資料 |

#### send

將效益參數上拋

| Parameter |                     Type                      | Required |   Default   | Description      |
| :-------- | :-------------------------------------------: | :------: | :---------: | :--------------- |
| payload   | ProducePayloadModel&lt;Bnft.BenefitSaving&gt; | Required | `undefined` | 效益參數         |
| sendable  |                    boolean                    | Optional |    true     | 執行結果是否上拋 |

#### findLatestLaborCost

取得最新的 IDL 或 ID 人員工時

| Parameter |                       Type                       | Required |   Default   | Description                   |
| :-------- | :----------------------------------------------: | :------: | :---------: | :---------------------------- |
| site      |                      string                      | Required | `undefined` | Site                          |
| plantCode |                      string                      | Required | `undefined` | 廠別代碼                      |
| laborType |                'dl' &#124; 'idl'                 | Required | `undefined` | 人員類別(IDL or DL)           |
| returns   | Observable&lt;BenefitLatestLaborCostResponse&gt; | Required | `undefined` | 回傳最新的 IDL 或 ID 人員工時 |

#### setHttp

設定自定義的 HTTP

| Parameter |     Type     | Required |   Default   | Description      |
| :-------- | :----------: | :------: | :---------: | :--------------- |
| http      | HttpAdapter  | Required | `undefined` | 自定義 HTTP 請求 |
| returns   | BnftTemplate | Required | `undefined` | 回傳物件本身     |

## **_BenefitConfigModel_**

**_Interface_**，效益範本設定檔資料模型

### Properties

#### dev

|  Type   | Required | Default | Description |
| :-----: | :------: | :-----: | :---------- |
| boolean | Optional | `false` | 開發模式    |

#### systemId

|  Type  | Required |   Default   | Description |
| :----: | :------: | :---------: | :---------- |
| string | Required | `undefined` | 效益系統 ID |

#### typeId

|  Type  | Required |   Default   | Description |
| :----: | :------: | :---------: | :---------- |
| string | Required | `undefined` | 效益類型 ID |

#### benefitType

|    Type     | Required |   Default   | Description |
| :---------: | :------: | :---------: | :---------- |
| BenefitType | Required | `undefined` | 效益類型    |

#### publishApi

|  Type  | Required |   Default   | Description           |
| :----: | :------: | :---------: | :-------------------- |
| string | Required | `undefined` | 要拋送參數的 API 路徑 |

#### benefitApi

|  Type  | Required |   Default   | Description     |
| :----: | :------: | :---------: | :-------------- |
| string | Required | `undefined` | 效益的 API 路徑 |

#### retry

|  Type  | Required |   Default   | Description  |
| :----: | :------: | :---------: | :----------- |
| number | Optional | `undefined` | 重拋嘗試次數 |

# Resend API Usage

> 執行效益計算 Job，執行成功，可看見以下 LOG，並在瀏覽器輸
> 入`http://localhost:3000/`，可開啟 Swagger API Explorer

```log
[2021-02-17T10:30:24.562] [INFO] api - Listen api port 3000
```

## 重新上拋特定時間的所有效益

```
curl -X POST "http://localhost:3000/benefit/send?timestamp=1609430400000" -H  "accept: application/json"
```

| Paramter  |     Type      | Required |   Default   | Description    |
| :-------: | :-----------: | :------: | :---------: | :------------- |
| timestamp | query: number | Required | `undefined` | 重新上拋的時間 |

## 重新上拋特定效益

```
curl -X POST "http://localhost:3000/specific/benefit/send?systemId=mytest&typeId=cost_idl2&timestamp=1609430400000" -H  "accept: application/json"
```

| Paramter  |     Type      | Required |   Default   | Description    |
| :-------: | :-----------: | :------: | :---------: | :------------- |
| systemId  | query: string | Required | `undefined` | 系統 ID        |
|  typeId   | query: string | Required | `undefined` | 效益 ID        |
| timestamp | query: number | Required | `undefined` | 重新上拋的時間 |

## 重新上拋特定時間區間內的所有效益

```
curl -X POST "http://localhost:3000/benefit/send/timestamps" -H  "accept: application/json" -H  "Content-Type: application/json" -d "[1609430400000,1609516800000]"
```

| Paramter |   Type   | Required |   Default   | Description        |
| :------: | :------: | :------: | :---------: | :----------------- |
|   body   | number[] | Required | `undefined` | 重新上拋的時間區間 |

## 重新上拋特定時間區間內的特定效益

```
curl -X POST "http://localhost:3000/specific/benefit/send/timestamps?systemId=mytest&typeId=cost_idl2" -H  "accept: application/json" -H  "Content-Type: application/json" -d "[1609430400000]"
```

| Paramter |     Type      | Required |   Default   | Description        |
| :------: | :-----------: | :------: | :---------: | :----------------- |
| systemId | query: string | Required | `undefined` | 系統 ID            |
|  typeId  | query: string | Required | `undefined` | 效益 ID            |
|   body   |   number[]    | Required | `undefined` | 重新上拋的時間區間 |

## 重拋上拋失敗的效益

```
curl -X POST "http://localhost:3000/benefit/backup" -H  "accept: application/json"
```
