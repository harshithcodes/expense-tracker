export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { description } = req.body || {}
  if (!description || description.trim().length < 2) {
    return res.status(400).json({ error: 'No description provided' })
  }

  const category = categorize(description)
  return res.status(200).json({ category })
}

function categorize(text) {
  const t = text.toLowerCase().trim()

  const rules = [
    {
      category: 'Food & Dining',
      keywords: [
        'swiggy','zomato','blinkit','zepto','bigbasket','grofers','dunzo','instamart',
        'restaurant','cafe','coffee','tea','chai','dhaba','biryani','pizza','burger',
        'kfc','mcdonalds','dominos','subway','burger king','haldirams','ccd','starbucks',
        'food','meal','dinner','lunch','breakfast','snack','juice','tiffin','dabba',
        'grocery','vegetables','fruits','sabzi','doodh','milk','bread','eggs','rice',
        'sweets','mithai','bakery','pastry','cake','hotel','bar','pub','dine',
        'maggi','noodles','paratha','idli','dosa','vada','samosa','chaat',
      ]
    },
    {
      category: 'Transport',
      keywords: [
        'uber','ola','rapido','namma yatri','indrive','blablacar',
        'metro','bus','auto','rickshaw','taxi','cab','share',
        'irctc','railway','train','flight','airline','indigo','spicejet',
        'air india','vistara','go first','akasa','airport','booking',
        'petrol','diesel','fuel','hp pump','iocl','bharat petroleum','indian oil',
        'parking','toll','fastag','highway',
        'bike','scooter','vehicle','car wash','service center',
        'ola electric','bounce','yulu','vogo','metro card','metro recharge',
      ]
    },
    {
      category: 'Entertainment',
      keywords: [
        'netflix','hotstar','prime video','amazon prime','sony liv','zee5',
        'disney','jiocinema','mxplayer','voot','altbalaji',
        'spotify','gaana','wynk','jiosaavn','apple music','youtube premium',
        'movie','cinema','theatre','pvr','inox','carnival','multiplex','show','imax',
        'game','gaming','steam','playstation','xbox','pubg','bgmi','free fire',
        'concert','event','ticket','bookmyshow','paytm insider','district',
        'fun','amusement','waterpark','escape room','bowling',
      ]
    },
    {
      category: 'Utilities',
      keywords: [
        'airtel','jio','vi ','vodafone','bsnl','tata sky','dish tv','d2h','sun direct',
        'electricity','electric','power bill','bescom','tata power','adani electricity',
        'msedcl','kseb','tneb','cesc','wbsedcl',
        'water bill','sewage','municipal','bmc','bbmp',
        'lpg','gas cylinder','indane','hp gas','bharat gas','piped gas','igl',
        'broadband','wifi','internet','fiber','hathway','act fibernet',
        'recharge','mobile bill','postpaid','prepaid','data pack',
        'rent','maintenance','society','apartment','hoa','rwa',
        'insurance','lic','premium','policy',
      ]
    },
    {
      category: 'Shopping',
      keywords: [
        'amazon','flipkart','meesho','myntra','ajio','nykaa','tata cliq','reliance digital',
        'croma','vijay sales','dmart','big bazaar','more','spencer','lifestyle',
        'clothes','shirt','pant','jeans','dress','shoes','sandal','chappal','sneaker',
        'kurta','saree','dupatta','suit','blazer','tshirt','jacket','cap',
        'electronics','mobile','laptop','tablet','headphone','earphone','charger',
        'smartwatch','camera','speaker','mouse','keyboard','monitor',
        'furniture','sofa','bed','table','chair','curtain','mattress',
        'book','stationery','pen','notebook','school','college',
        'toy','gift','cosmetic','makeup','skincare','perfume','deodorant',
        'watch','jewellery','bag','purse','wallet','sunglasses',
      ]
    },
    {
      category: 'Health',
      keywords: [
        'hospital','clinic','doctor','dr.','physician','specialist','consultation','opd',
        'pharmacy','chemist','medicine','tablet','capsule','syrup','injection','drops',
        'apollo','fortis','manipal','medanta','aiims','max hospital','narayana','columbia asia',
        'medplus','netmeds','1mg','pharmeasy','practo','healthkart','tata 1mg',
        'gym','fitness','yoga','workout','crossfit','zumba','cult.fit','cultfit','cult fit','gold gym',
        'protein','supplement','vitamin','whey','creatine',
        'lab','blood test','scan','xray','mri','ct scan','diagnostic','thyrocare','lal path',
        'dental','dentist','eye','optician','spectacles','contact lens','lenskart',
        'physiotherapy','therapist','mental health','psychiatrist','psychologist',
      ]
    },
  ]

  // Score each category
  const scores = {}
  for (const rule of rules) {
    let score = 0
    for (const kw of rule.keywords) {
      if (t.includes(kw)) {
        // Longer keyword matches are more specific, weight them higher
        score += kw.length >= 6 ? 2 : 1
      }
    }
    if (score > 0) scores[rule.category] = score
  }

  if (Object.keys(scores).length === 0) return 'Other'
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
}
