export type SlideAccent = "violet" | "cyan" | "lime" | "pink" | "orange" | "yellow";

export type SlideLayout =
  | "hero"
  | "split-visual"
  | "comparison-matrix"
  | "process-flow"
  | "roadmap-close";

export type SlideDiagram = "dual-meaning" | "human-loop" | "marketplace";

export type SlideVisualType = "image" | "collage" | "mockup" | "diagram";

export type SlideVisualRatio = "4:5" | "16:10" | "16:9" | "square";

export type SlideVisual = {
  type: SlideVisualType;
  assetPath?: string;
  src?: string;
  alt: string;
  ratio: SlideVisualRatio;
  title?: string;
  caption?: string;
  placeholderLabel: string;
  guidance: string;
  idealSize: string;
  minimumSize: string;
};

export type SlideMatrixItem = {
  label?: string;
  title: string;
  items: string[];
  emphasis?: string;
};

export type SlideCard = {
  label?: string;
  title: string;
  body: string;
};

export type SlideStep = {
  title: string;
  description: string;
};

export type SlideStat = {
  label: string;
  value: string;
  note?: string;
};

export type SlideRoadmapPhase = {
  phase: string;
  title: string;
  description: string;
};

export type SlideDefinition = {
  id: string;
  title: string;
  sectionLabel: string;
  kicker: string;
  thesis: string;
  layout: SlideLayout;
  accent: SlideAccent;
  bullets?: string[];
  statements?: string[];
  emphasis?: string;
  diagram?: SlideDiagram;
  visual?: SlideVisual;
  visuals?: SlideVisual[];
  matrix?: SlideMatrixItem[];
  cards?: SlideCard[];
  steps?: SlideStep[];
  stats?: SlideStat[];
  roadmap?: SlideRoadmapPhase[];
};

export const presentationSlides: SlideDefinition[] = [
  {
    id: "cover",
    title: "Nho Ti",
    sectionLabel: "Nho Ti",
    kicker: "Pitch deck",
    thesis: "Nền tảng AI kết nối sinh viên với doanh nghiệp SME qua các micro-project thực tế.",
    layout: "hero",
    accent: "violet",
    bullets: [
      "Bắt đầu từ đầu việc nhỏ nhưng đủ thật để học và làm.",
      "Dùng AI để làm rõ brief, gợi ý đúng người và giảm ma sát triển khai.",
      "Đo giá trị bằng đầu ra thật cho cả sinh viên lẫn SME.",
    ],
    statements: ["Micro-project", "AI hỗ trợ", "Hai phía"],
    emphasis: "Việc nhỏ, giá trị thật.",
    stats: [
      {
        label: "Mô hình",
        value: "Nền tảng 2 phía",
        note: "Kết nối sinh viên với SME thay vì chỉ đăng việc một chiều.",
      },
      {
        label: "Điểm nghẽn",
        value: "Brief + matching",
        note: "AI đứng giữa để làm rõ nhu cầu và ghép đúng người hơn.",
      },
      {
        label: "Giai đoạn",
        value: "Early MVP",
        note: "Đang kiểm chứng mô hình trước khi mở rộng.",
      },
    ],
    visual: {
      type: "image",
      assetPath: "/presentation/cover-hero.png",
      alt: "Hero visual cho Nho Ti kết nối sinh viên, SME và AI",
      ratio: "4:5",
      title: "Hero mở đầu",
      caption: "Hero visual dùng lại từ bộ ảnh hiện có của dự án.",
      placeholderLabel: "Ảnh cover mở đầu",
      guidance:
        "Một visual thể hiện Nho Ti là cầu nối giữa sinh viên, SME và AI; có 1-2 nhân vật, laptop hoặc dashboard, cảm giác startup giáo dục công nghệ, nền sáng và sạch, không chèn chữ vào ảnh.",
      idealSize: "1600x2000",
      minimumSize: "1200x1500",
    },
  },
  {
    id: "what-is-nhoti",
    title: "“Nhỏ tí” cho sinh viên, “nhờ tí” cho SME",
    sectionLabel: "01",
    kicker: "Định vị",
    thesis: "Tên gọi Nho Ti gói đúng mô hình: việc nhỏ nhưng đủ thật để sinh viên học từ thực tế và SME giải quyết nhu cầu số hóa ngắn hạn.",
    layout: "split-visual",
    accent: "yellow",
    bullets: [
      "Không chỉ là nơi đăng việc, mà là mô hình chuẩn hóa và triển khai micro-project.",
      "Giá trị không dừng ở kết nối; giá trị nằm ở đầu ra thật và hồ sơ thực chiến tích lũy.",
    ],
    statements: ["Nhỏ tí", "Nhờ tí", "AI kết nối"],
    emphasis: "Nho Ti đứng giữa hai nhu cầu thật: cơ hội làm thật và nhu cầu số hóa việc thật.",
    diagram: "dual-meaning",
    cards: [
      {
        label: "Sinh viên",
        title: "Nhỏ tí",
        body: "Bắt đầu từ project nhỏ để xây kỹ năng, portfolio và sự tự tin.",
      },
      {
        label: "Doanh nghiệp",
        title: "Nhờ tí",
        body: "Những đầu việc nhỏ nhưng thực tế, cần đúng người hỗ trợ nhanh.",
      },
      {
        label: "Mô hình",
        title: "AI kết nối",
        body: "Làm rõ nhu cầu, ghép đúng người và tạo quy trình triển khai rõ hơn.",
      },
    ],
  },
  {
    id: "problem-market",
    title: "Khoảng trống giữa học và làm",
    sectionLabel: "02",
    kicker: "Problem",
    thesis: "Sinh viên cần cơ hội làm thật để chứng minh năng lực; SME có việc thật nhưng khó tìm đúng người cho các bài toán nhỏ.",
    layout: "split-visual",
    accent: "pink",
    bullets: [
      "Sinh viên thường thiếu dự án thật, portfolio thật và phản hồi thật khi đi xin việc.",
      "SME có nhiều nhu cầu số hóa nhỏ nhưng brief còn mơ hồ, ngân sách hạn chế và không muốn tuyển full-time.",
    ],
    statements: ["Portfolio mỏng", "Brief mơ hồ", "Lệch pha thị trường"],
    emphasis: "Cơ hội và nhu cầu đều có thật, nhưng chưa gặp nhau theo một cách đủ thực dụng.",
    visuals: [
      {
        type: "image",
        assetPath: "/presentation/problem-student.webp",
        alt: "Sinh viên có kỹ năng nhưng thiếu cơ hội thực chiến",
        ratio: "square",
        title: "Phía sinh viên",
        caption: "Visual nên gợi cảm giác có năng lực nhưng thiếu cơ hội làm thật.",
        placeholderLabel: "Tạo ảnh cho pain point phía sinh viên",
        guidance:
          "Sinh viên có kỹ năng nhưng thiếu cơ hội thực chiến: laptop, CV hoặc portfolio, tinh thần muốn làm thật nhưng chưa có dự án thật; nên tích cực nhưng vẫn thể hiện khoảng thiếu cơ hội.",
        idealSize: "1400x1400",
        minimumSize: "1200x1200",
      },
      {
        type: "image",
        assetPath: "/presentation/problem-sme.webp",
        alt: "Chủ SME có nhiều việc số hóa nhỏ nhưng thiếu nguồn lực phù hợp",
        ratio: "square",
        title: "Phía SME",
        caption: "Visual nên gợi cảm giác bận rộn, nhiều việc nhỏ nhưng thiếu nguồn lực phù hợp.",
        placeholderLabel: "Tạo ảnh cho pain point phía SME",
        guidance:
          "Chủ SME hoặc team nhỏ với nhiều việc số hóa nhỏ: laptop, bảng việc, bối cảnh vận hành cửa hàng hoặc văn phòng nhỏ, cảm giác bận rộn và thiếu người phù hợp để xử lý nhanh.",
        idealSize: "1400x1400",
        minimumSize: "1200x1200",
      },
    ],
  },
  {
    id: "market-gap",
    title: "Giải pháp hiện tại chưa chạm đúng điểm nghẽn",
    sectionLabel: "03",
    kicker: "Gap",
    thesis: "Job board và freelancer marketplace giải quyết tốt ngữ cảnh riêng của họ, nhưng chưa phục vụ tốt nhóm micro-project cho SME và sinh viên.",
    layout: "comparison-matrix",
    accent: "orange",
    bullets: [
      "Job board mạnh ở tuyển dụng dài hạn, không tối ưu cho việc nhỏ và thay đổi nhanh.",
      "Freelancer marketplace mạnh ở thuê người đã có hồ sơ mạnh; sinh viên thường khó nổi bật.",
    ],
    emphasis: "Khoảng trống còn lại là việc nhỏ, brief chưa rõ và nhu cầu tích lũy hồ sơ thực chiến.",
    matrix: [
      {
        label: "Mô hình 1",
        title: "Job board",
        items: [
          "Tối ưu cho vị trí dài hạn.",
          "Doanh nghiệp phải viết yêu cầu khá rõ ngay từ đầu.",
          "Không hợp với việc ngắn, nhỏ và cần thử nhanh.",
        ],
      },
      {
        label: "Mô hình 2",
        title: "Freelancer marketplace",
        items: [
          "Tối ưu cho người làm đã có kinh nghiệm.",
          "Sinh viên khó nổi bật khi thiếu portfolio mạnh.",
          "SME vẫn phải tự biến việc nhỏ thành brief đủ rõ.",
        ],
      },
      {
        label: "Khoảng trống",
        title: "Nho Ti nhắm tới",
        items: [
          "Chuẩn hóa bài toán nhỏ thành project có thể giao.",
          "Gợi ý người phù hợp theo năng lực.",
          "Đo giá trị bằng đầu ra thật và phản hồi thật.",
        ],
      },
    ],
  },
  {
    id: "solution-flow",
    title: "Quy trình giá trị của Nho Ti",
    sectionLabel: "04",
    kicker: "Solution",
    thesis: "Nho Ti chuẩn hóa brief, gợi ý đúng người và biến đầu việc nhỏ thành một quy trình có thể giao, theo dõi và đánh giá.",
    layout: "process-flow",
    accent: "cyan",
    bullets: [
      "Doanh nghiệp không cần bắt đầu bằng một brief hoàn chỉnh.",
      "Sinh viên thấy project phù hợp thay vì tự mò cơ hội rời rạc.",
    ],
    steps: [
      {
        title: "SME nêu nhu cầu",
        description: "Bắt đầu từ mô tả thô của một đầu việc số hóa nhỏ.",
      },
      {
        title: "AI chuẩn hóa brief",
        description: "Làm rõ mục tiêu, đầu ra, kỹ năng và kỳ vọng cơ bản.",
      },
      {
        title: "Matching sinh viên",
        description: "Gợi ý người phù hợp theo hồ sơ năng lực và embedding.",
      },
      {
        title: "Triển khai và đánh giá",
        description: "Theo dõi tiến độ, nộp bàn giao và đánh giá sau khi hoàn thành.",
      },
    ],
    stats: [
      {
        label: "Brief",
        value: "Rõ hơn",
        note: "Giảm ma sát ngay từ bước mô tả yêu cầu.",
      },
      {
        label: "Matching",
        value: "Sát hơn",
        note: "Không chỉ liệt kê, mà gợi ý theo độ phù hợp.",
      },
      {
        label: "Kết quả",
        value: "Đo được",
        note: "Có đầu ra, phản hồi và hồ sơ thực chiến tích lũy.",
      },
    ],
    visual: {
      type: "mockup",
      assetPath: "/presentation/product-ai-brief.png",
      alt: "Ảnh chụp giao diện tạo project với AI brief wizard của Nho Ti",
      ratio: "16:10",
      title: "Ảnh sản phẩm: AI brief flow",
      caption: "Screenshot thật từ flow SME tạo project và chat với AI.",
      placeholderLabel: "Ảnh sản phẩm: flow AI brief",
      guidance:
        "Screenshot thật của giao diện SME tạo project: khung chat AI bên trái và form tự động bên phải.",
      idealSize: "1920x1200",
      minimumSize: "1600x1000",
    },
  },
  {
    id: "ai-support",
    title: "AI hỗ trợ, không thay thế",
    sectionLabel: "05",
    kicker: "AI role",
    thesis: "AI giúp giảm ma sát trong quy trình; con người vẫn quyết định bối cảnh, phản hồi và chất lượng đầu ra.",
    layout: "split-visual",
    accent: "lime",
    bullets: [
      "AI mạnh ở phần lặp lại, mơ hồ và tốn thời gian diễn đạt.",
      "Con người vẫn chịu trách nhiệm cho kết quả cuối cùng.",
    ],
    emphasis: "Trong thời đại AI, giá trị của sinh viên là biết dùng AI để giải quyết bài toán thật.",
    diagram: "human-loop",
    cards: [
      {
        label: "Vai trò 1",
        title: "Chuẩn hóa brief",
        body: "Biến mô tả thô thành yêu cầu dễ hiểu và dễ giao việc hơn.",
      },
      {
        label: "Vai trò 2",
        title: "Matching",
        body: "So sánh yêu cầu với hồ sơ kỹ năng để gợi ý độ phù hợp.",
      },
      {
        label: "Vai trò 3",
        title: "Hỗ trợ quy trình",
        body: "Tóm tắt tiến độ, nhắc deadline và gợi ý bước tiếp theo.",
      },
    ],
  },
  {
    id: "differentiation",
    title: "Điểm khác biệt của Nho Ti",
    sectionLabel: "06",
    kicker: "Differentiation",
    thesis: "Khác biệt không nằm ở việc đăng thật nhiều job, mà ở cách biến bài toán nhỏ thành đầu ra thật và hồ sơ thực chiến.",
    layout: "comparison-matrix",
    accent: "yellow",
    statements: ["Brief rõ hơn", "Matching sát hơn", "Đầu ra thật", "Hồ sơ thực chiến"],
    emphasis: "Mỗi project tốt đều tạo thêm giá trị cho cả SME lẫn hồ sơ năng lực của sinh viên.",
    cards: [
      {
        title: "Chuẩn hóa bài toán nhỏ",
        body: "Biến nhu cầu mơ hồ thành project có thể giao và đánh giá.",
      },
      {
        title: "Kết nối theo năng lực",
        body: "Không chỉ hiển thị danh sách, mà gợi ý người phù hợp hơn.",
      },
      {
        title: "Đo bằng đầu ra thật",
        body: "Giá trị thể hiện ở sản phẩm bàn giao và phản hồi thực tế.",
      },
      {
        title: "Tích lũy hồ sơ thực chiến",
        body: "Sinh viên xây năng lực theo thời gian qua từng project đã làm.",
      },
    ],
  },
  {
    id: "mvp-stage",
    title: "Early MVP đang kiểm chứng 4 giả thuyết",
    sectionLabel: "07",
    kicker: "MVP",
    thesis: "Mục tiêu hiện tại không phải scale nhanh, mà là xác nhận mô hình này có tạo giá trị thật hay không.",
    layout: "split-visual",
    accent: "orange",
    bullets: [
      "Có SME thật sự cần giải quyết việc số hóa nhỏ theo mô hình linh hoạt hơn.",
      "Có sinh viên thật sự muốn làm micro-project để tích lũy trải nghiệm thực chiến.",
      "Matching giữa hai bên có thể tạo ra hợp tác thành công.",
      "Nếu giá trị đủ rõ, SME có động lực trả phí cho mô hình này.",
    ],
    emphasis: "Chưa có user thật không phải điểm yếu; đó là trạng thái trung thực để kiểm chứng đúng điều cốt lõi.",
    stats: [
      {
        label: "Stage",
        value: "Early MVP",
        note: "Bản mẫu ban đầu để kiểm chứng mô hình.",
      },
      {
        label: "Người dùng thật",
        value: "Chưa có",
        note: "Chưa chạy thị trường rộng ở thời điểm hiện tại.",
      },
      {
        label: "Mục tiêu",
        value: "Kiểm chứng",
        note: "Xác nhận giá trị trước khi nghĩ đến mở rộng.",
      },
    ],
    visual: {
      type: "mockup",
      assetPath: "/presentation/product-progress.png",
      alt: "Ảnh chụp giao diện quản lý dự án đang triển khai và tiến độ bàn giao",
      ratio: "16:10",
      title: "Ảnh sản phẩm: progress và bàn giao",
      caption: "Screenshot thật từ luồng student my projects / project progress.",
      placeholderLabel: "Ảnh sản phẩm: progress flow",
      guidance:
        "Screenshot thật của màn hình theo dõi tiến độ, milestone, update và bàn giao sản phẩm.",
      idealSize: "1920x1200",
      minimumSize: "1600x1000",
    },
  },
  {
    id: "two-sided-marketplace",
    title: "Khách hàng mục tiêu và doanh thu bắt đầu từ SME",
    sectionLabel: "08",
    kicker: "Business model",
    thesis: "Nho Ti là nền tảng hai phía, nhưng bên trả phí hợp lý nhất trong giai đoạn đầu là SME.",
    layout: "split-visual",
    accent: "cyan",
    bullets: [
      "Phía cầu: SME có đầu việc ngắn hạn, rõ ngân sách và cần triển khai linh hoạt.",
      "Phía cung: sinh viên muốn dự án thật để xây năng lực và portfolio.",
      "Doanh thu giai đoạn đầu đến từ phí đăng project, ghép nối hoặc hỗ trợ quản lý project nhỏ.",
    ],
    emphasis: "Bên trả phí đầu tiên: SME.",
    stats: [
      {
        label: "Phía trả phí",
        value: "SME",
        note: "Nhận giá trị trực tiếp từ việc hoàn thành đầu việc.",
      },
      {
        label: "Nguồn cung",
        value: "Sinh viên",
        note: "Tích lũy trải nghiệm thật và làm giàu pool nhân lực.",
      },
      {
        label: "Giá trị",
        value: "Linh hoạt",
        note: "Phù hợp với việc nhỏ, ngắn hạn và cần triển khai nhanh.",
      },
    ],
    visual: {
      type: "mockup",
      assetPath: "/presentation/product-matching.png",
      alt: "Ảnh chụp giao diện matching sinh viên hoặc gợi ý ứng viên của Nho Ti",
      ratio: "16:10",
      title: "Ảnh sản phẩm: matching",
      caption: "Screenshot thật từ luồng SME tìm sinh viên hoặc student project recommendation.",
      placeholderLabel: "Ảnh sản phẩm: matching flow",
      guidance:
        "Screenshot thật của màn hình matching: danh sách ứng viên hoặc dự án có match score và thông tin kỹ năng.",
      idealSize: "1920x1200",
      minimumSize: "1600x1000",
    },
  },
  {
    id: "value-created",
    title: "Giá trị tạo ra cho cả hai bên",
    sectionLabel: "09",
    kicker: "Value",
    thesis: "Mỗi project tốt không chỉ giải quyết một việc, mà còn tạo thêm dữ liệu năng lực và khả năng hợp tác lâu dài.",
    layout: "comparison-matrix",
    accent: "violet",
    emphasis: "Giá trị nằm ở giao dịch hoàn thành và ở mối quan hệ, năng lực, dữ liệu được tích lũy sau đó.",
    matrix: [
      {
        label: "Sinh viên",
        title: "Nhận được gì?",
        items: [
          "Dự án thật để rèn kỹ năng trong bối cảnh doanh nghiệp.",
          "Portfolio có minh chứng, phản hồi và đầu ra rõ ràng.",
          "Sự tự tin và khả năng tiến tới hợp tác dài hơn.",
        ],
      },
      {
        label: "SME",
        title: "Nhận được gì?",
        items: [
          "Giải quyết đầu việc nhỏ nhanh hơn và phù hợp ngân sách hơn.",
          "Tiếp cận nguồn nhân lực trẻ cho nhu cầu hiện tại và tương lai.",
          "Cơ hội phát hiện cộng tác viên phù hợp từ project nhỏ.",
        ],
      },
    ],
  },
  {
    id: "long-term-vision",
    title: "Tầm nhìn dài hạn",
    sectionLabel: "10",
    kicker: "Vision",
    thesis: "Nếu mô hình được kiểm chứng, Nho Ti có thể đi từ micro-project platform thành hệ sinh thái kết nối học tập, thực chiến và phát triển nghề nghiệp.",
    layout: "roadmap-close",
    accent: "yellow",
    statements: ["Học tập", "Thực chiến", "Nghề nghiệp", "SME số hóa"],
    emphasis: "Tầm nhìn dài hạn chỉ có ý nghĩa khi giai đoạn đầu kiểm chứng đúng giá trị cốt lõi.",
    visual: {
      type: "image",
      assetPath: "/presentation/vision-ecosystem.webp",
      alt: "Visual hệ sinh thái học tập, thực chiến, nghề nghiệp và SME được kết nối",
      ratio: "16:9",
      title: "Vision ecosystem",
      caption: "Ảnh vision nên có cảm giác mở rộng, tích cực và kết nối rõ ràng.",
      placeholderLabel: "Tạo ảnh cho slide tầm nhìn dài hạn",
      guidance:
        "Một visual khái niệm về hệ sinh thái học tập, trải nghiệm thực chiến, nghề nghiệp và SME được kết nối; cảm giác mở rộng, tích cực, nhiều liên kết nhưng không rối, chừa không gian để đặt roadmap.",
      idealSize: "1920x1080",
      minimumSize: "1600x900",
    },
    roadmap: [
      {
        phase: "01",
        title: "Micro-project platform",
        description: "Bắt đầu từ việc kết nối các đầu việc nhỏ, ngắn hạn và có đầu ra rõ.",
      },
      {
        phase: "02",
        title: "Hồ sơ thực chiến",
        description: "Tích lũy dữ liệu năng lực thật của sinh viên qua từng project.",
      },
      {
        phase: "03",
        title: "Cầu nối nhân lực trẻ",
        description: "Giúp SME phát hiện và hợp tác tiếp với những bạn phù hợp.",
      },
      {
        phase: "04",
        title: "Hệ sinh thái học và làm",
        description: "Kết nối đào tạo, trải nghiệm thực tế và nhu cầu lao động trong thời đại AI.",
      },
    ],
  },
  {
    id: "conclusion",
    title: "Bắt đầu từ việc nhỏ, đi tới giá trị thật",
    sectionLabel: "11",
    kicker: "Conclusion",
    thesis: "Nho Ti xuất phát từ một khoảng trống có thật trên thị trường và chọn một cách giải quyết đủ nhỏ để kiểm chứng, nhưng đủ rõ để tạo tác động.",
    layout: "hero",
    accent: "cyan",
    bullets: [
      "Vấn đề là thật: sinh viên cần cơ hội làm thật, SME cần giải pháp phù hợp cho việc thật.",
      "Giải pháp là thực dụng: dùng AI để giảm ma sát trong mô hình hai phía.",
      "Việc cần làm lúc này là kiểm chứng thật tốt trước khi mở rộng.",
    ],
    statements: ["Problem is real", "Solution is practical", "Now: validate"],
    emphasis: "Tinh thần của Nho Ti là: từ điều nhỏ có thể tạo ra giá trị lớn hơn nếu được kết nối đúng cách.",
    visual: {
      type: "image",
      assetPath: "/presentation/cover-hero.png",
      alt: "Hero visual được tái sử dụng cho slide kết luận của Nho Ti",
      ratio: "4:5",
      title: "Hero kết luận",
      caption: "Slide kết luận tái sử dụng hero visual của deck.",
      placeholderLabel: "Ảnh cover kết luận",
      guidance:
        "Dùng lại ảnh cover mở đầu cho slide kết luận; nếu tạo mới thì vẫn giữ cùng phong cách, nền sáng, sạch và thể hiện cầu nối giữa sinh viên, SME và AI.",
      idealSize: "1600x2000",
      minimumSize: "1200x1500",
    },
  },
];
