export default function AboutPage() {
  return (
    <div
      className="min-h-screen pb-8"
      style={{ backgroundImage: 'url(/bg-pattern.png)', backgroundSize: '320px', backgroundRepeat: 'repeat', backgroundColor: '#f5f0eb' }}
    >
      <div className="mx-auto max-w-md space-y-4 px-4 pt-5">

        {/* 徳本上人とは */}
        <div className="rounded-2xl p-4" style={{ border: '2px solid #d4c5b0', overflow: 'auto', backgroundColor: 'rgba(255,255,255,0.8)' }}>
          {/* 道具：右上に float */}
          <img src="/tokuhon-items.png" alt="旅の道具"
            style={{ float: 'right', height: '7rem', width: 'auto', marginLeft: '10px', marginBottom: '4px' }} />

          <h2 className="mb-2 text-lg" style={{ color: '#423629' }}>徳本上人とは</h2>

          <p className="text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            江戸時代後期に活躍した浄土宗の僧侶（生没年は1758～1818年）。紀伊国（現在の和歌山県）出身で、独自の書体による「南無阿弥陀仏」の名号を全国に広めた「念仏行者」として知られています。民衆からも熱烈な支持を受けた名僧で、その教えは「流行神（はやりがみ）」と言われるほどブームになりました。
          </p>

          {/* 僧侶：左下に float（テキストの後に配置） */}
          <img src="/tokuhon-monk.png" alt="徳本上人"
            style={{ float: 'left', height: '9rem', width: 'auto', marginRight: '10px', marginTop: '4px' }} />

          <p className="text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            文化9年（1812）に和歌山の総持寺で7日間の修行の際、2万人の参詣者と200隻の参詣船が集まったと記録されています。
          </p>
        </div>

        {/* 木食の行 */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ border: '2px solid #d4c5b0', backgroundColor: 'rgba(255,255,255,0.8)' }}>
          <h2 className="mb-3 flex items-center gap-2 text-lg" style={{ color: '#423629' }}>
            木食の行（もくじきのぎょう）
          </h2>
          <p className="mb-4 text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            穀物を断ち、木の実や木の皮だけを食べながら修行する苦行。この厳しい修行を通じて心身を清め、全国へ念仏を広めていきました。
          </p>

          {/* 図解エリア */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid #d4c5b0' }}>
              <p className="mb-2 text-sm" style={{ color: '#423629' }}>✅ 許された食べ物</p>
              <img src="/food-allowed.png" alt="許された食べ物" className="mx-auto h-24 w-auto" />
              <p className="mt-2 text-xs" style={{ color: '#5a5a5a' }}>木の実・きのこ・山菜</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid #d4c5b0' }}>
              <p className="mb-2 text-sm" style={{ color: '#423629' }}>❌ 断たれた食べ物</p>
              <img src="/food-prohibited.png" alt="断たれた食べ物" className="mx-auto h-24 w-auto" />
              <p className="mt-2 text-xs" style={{ color: '#5a5a5a' }}>お米・小麦・豆類</p>
            </div>
          </div>
        </div>

        {/* 徳本文字 */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ border: '2px solid #d4c5b0', backgroundColor: 'rgba(255,255,255,0.8)', overflow: 'auto' }}>
          <h2 className="mb-3 text-lg" style={{ color: '#423629' }}>
            徳本文字
          </h2>
          {/* キャラアイコン：右下に float */}
          <img src="/tokuhon-writer.png" alt="徳本文字を書く上人"
            style={{ float: 'right', height: '9rem', width: 'auto', marginLeft: '10px', marginTop: '4px' }} />
          <p className="text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            通常の楷書とは異なる独特な丸みを帯びた書体で、特に終筆（最後の筆の運び）が跳ね上がるスタイル。優しく特徴的な字体が「縁起が良い」とされ、全国で<span style={{ color: '#b35c44' }}>1,500基以上</span>の石碑（名号碑）に刻まれている。
          </p>
        </div>

        {/* 全国巡礼 */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ border: '2px solid #d4c5b0', backgroundColor: 'rgba(255,255,255,0.8)' }}>
          <h2 className="mb-3 text-lg" style={{ color: '#423629' }}>
            全国巡礼の旅
          </h2>
          <img src="/tokuhon-journey.png" alt="全国巡礼" className="w-full rounded-xl mb-3" />
          <p className="text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            寛政6年（1794）頃から約20年かけて近畿、東海、関東、北陸、信州など全国を巡礼し、各地で念仏を広めました。40代以降は江戸（伝通院）を拠点に念仏布教を行い、関東地方を広く巡回しました。
          </p>
        </div>

        {/* 参拝マナー */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ border: '2px solid #d4c5b0', backgroundColor: 'rgba(255,255,255,0.8)' }}>
          <h2 className="mb-3 text-lg" style={{ color: '#423629' }}>
            名号碑めぐりのマナー
          </h2>
          <p className="mb-4 text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            名号碑の多くは寺院の境内や墓地の一角に静かに立っています。周囲への配慮を忘れず、大切に保存されてきた石碑を傷つけないよう心がけてください。
          </p>
          <img src="/tokuhon-manner.png" alt="名号碑めぐりのマナー" className="w-full rounded-xl" />
        </div>

      </div>
    </div>
  )
}
