export interface Passage {
  id: string;
  content: string;
  title?: string;
}

export interface Question {
  id: number;
  type: "reading" | "listening" | "writing" | "translation";
  question: string;
  options?: string[];
  answer?: number;
  explanation?: string;
  passageId?: string; // 关联到 passages 数组中的 passage
}

export interface ExamSection {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface ExamPaper {
  id: string;
  title: string;
  date: string;
  description: string;
  passages: Passage[];
  sections: ExamSection[];
}

// 第一套试卷：2025年6月卷1
const paper1: ExamPaper = {
  id: "cet6_2025_06_1",
  title: "2025年6月六级真题（第一套）",
  date: "2025-06",
  description: "2025年6月全国大学英语六级考试真题第一套",
  passages: [
    {
      id: "p1",
      title: "Passage One",
      content: `Climate change is one of the most pressing issues facing our planet today. The scientific consensus is clear: human activities, particularly the burning of fossil fuels, are releasing greenhouse gases into the atmosphere at an unprecedented rate. These gases trap heat from the sun, causing global temperatures to rise.

The consequences of this warming are far-reaching. Rising sea levels threaten coastal communities, extreme weather events are becoming more frequent and severe, and ecosystems around the world are being disrupted. Scientists warn that if we do not take immediate action to reduce emissions, the results could be catastrophic.

However, there is hope. Renewable energy technologies such as solar and wind power are becoming increasingly cost-effective. Many countries are implementing policies to reduce their carbon footprint. Individual actions, while important, are not sufficient on their own - systemic changes in how we produce and consume energy are needed.`
    },
    {
      id: "p2",
      title: "Passage Two",
      content: `The rapid advancement of artificial intelligence (AI) has transformed numerous industries and aspects of daily life. From virtual assistants on our smartphones to sophisticated algorithms that drive business decisions, AI is becoming increasingly integrated into our world.

One of the most significant impacts of AI has been in healthcare. Machine learning algorithms can now analyze medical images with accuracy that rivals or exceeds human doctors. AI-powered diagnostic tools are helping to detect diseases earlier, potentially saving countless lives. In drug discovery, AI is accelerating the process of identifying promising compounds, reducing the time and cost of bringing new treatments to market.

However, the rise of AI also raises important ethical questions. Concerns about job displacement, privacy, and algorithmic bias need to be addressed. As AI continues to evolve, society must find a balance between embracing innovation and ensuring that these technologies are developed and used responsibly.`
    },
    {
      id: "p3",
      title: "Passage Three",
      content: `Remote work has become increasingly common in recent years, accelerated by global events that forced many companies to adapt quickly. What began as a temporary solution has evolved into a permanent shift in how many organizations operate.

Studies have shown that remote work can offer numerous benefits. Employees often report higher job satisfaction due to improved work-life balance and elimination of commuting time. Companies can access a wider talent pool and reduce overhead costs associated with maintaining large office spaces.

Yet remote work also presents challenges. Many workers struggle with feelings of isolation and difficulty separating work from personal life. Collaboration and spontaneous creativity can be more difficult in a virtual environment. Organizations must invest in the right tools and develop new management strategies to ensure remote teams remain productive and connected.`
    }
  ],
  sections: [
    {
      id: "reading",
      title: "阅读理解",
      description: "仔细阅读以下短文，选择最佳答案",
      questions: [
        {
          id: 1,
          type: "reading",
          passageId: "p1",
          question: "What is the main cause of climate change according to the passage?",
          options: [
            "A. Natural climate cycles",
            "B. Human activities burning fossil fuels",
            "C. Solar radiation changes",
            "D. Volcanic eruptions"
          ],
          answer: 1,
          explanation: "文章明确指出 'human activities, particularly the burning of fossil fuels, are releasing greenhouse gases into the atmosphere at an unprecedented rate'，说明人类活动，特别是燃烧化石燃料，是气候变化的主要原因。"
        },
        {
          id: 2,
          type: "reading",
          passageId: "p1",
          question: "What does the passage suggest about individual actions?",
          options: [
            "A. They are the most important factor",
            "B. They are not necessary",
            "C. They are important but not sufficient alone",
            "D. They have no impact"
          ],
          answer: 2,
          explanation: "文章最后一段提到 'Individual actions, while important, are not sufficient on their own'，说明个人行动虽然重要，但单独不足以解决问题。"
        },
        {
          id: 3,
          type: "reading",
          passageId: "p1",
          question: "According to the passage, what is needed to address climate change?",
          options: [
            "A. Only individual actions",
            "B. Systemic changes in energy production and consumption",
            "C. Ignoring the problem",
            "D. More research"
          ],
          answer: 1,
          explanation: "文章最后强调 'systemic changes in how we produce and consume energy are needed'，说明需要在能源生产和消费方面进行系统性变革。"
        },
        {
          id: 4,
          type: "reading",
          passageId: "p2",
          question: "What is one of the most significant impacts of AI mentioned in the passage?",
          options: [
            "A. Entertainment industry",
            "B. Healthcare",
            "C. Social media",
            "D. Gaming"
          ],
          answer: 1,
          explanation: "文章明确指出 'One of the most significant impacts of AI has been in healthcare'，说明人工智能最重要的影响之一是在医疗保健领域。"
        },
        {
          id: 5,
          type: "reading",
          passageId: "p2",
          question: "How is AI helping in drug discovery?",
          options: [
            "A. By replacing human researchers",
            "B. By accelerating the process of identifying promising compounds",
            "C. By reducing the need for clinical trials",
            "D. By eliminating all side effects"
          ],
          answer: 1,
          explanation: "文章提到 'In drug discovery, AI is accelerating the process of identifying promising compounds'，说明人工智能正在加速识别有前景的化合物的过程。"
        },
        {
          id: 6,
          type: "reading",
          passageId: "p3",
          question: "What benefit of remote work do employees often report?",
          options: [
            "A. Higher salary",
            "B. Better work-life balance",
            "C. More vacation days",
            "D. Faster promotion"
          ],
          answer: 1,
          explanation: "文章指出 'Employees often report higher job satisfaction due to improved work-life balance'，说明员工经常报告由于工作与生活平衡的改善而有更高的工作满意度。"
        },
        {
          id: 7,
          type: "reading",
          passageId: "p3",
          question: "What challenge does remote work present according to the passage?",
          options: [
            "A. Higher costs for companies",
            "B. Feelings of isolation",
            "C. Lack of technology",
            "D. Too much supervision"
          ],
          answer: 1,
          explanation: "文章提到 'Many workers struggle with feelings of isolation'，说明许多员工在远程工作中感到孤立。"
        }
      ]
    },
    {
      id: "vocabulary",
      title: "选词填空",
      description: "从所给选项中选择最合适的词填入空白处",
      questions: [
        {
          id: 8,
          type: "reading",
          question: "The company's new policy has been _______ by employees as a positive step forward.",
          options: ["A. welcomed", "B. rejected", "C. ignored", "D. delayed"],
          answer: 0,
          explanation: "welcome 作动词表示'欢迎'，此处用被动语态表示政策被员工欢迎。"
        },
        {
          id: 9,
          type: "reading",
          question: "The research team is working _______ to find a solution to the problem.",
          options: ["A. tiredly", "B. diligently", "C. slowly", "D. rarely"],
          answer: 1,
          explanation: "diligently 意为'勤奋地'，符合语境。"
        }
      ]
    },
    {
      id: "writing",
      title: "写作",
      description: "根据要求完成写作任务",
      questions: [
        {
          id: 10,
          type: "writing",
          question: "Directions: For this part, you are allowed 30 minutes to write an essay on the importance of lifelong learning. You should write at least 150 words but no more than 200 words.",
          explanation: "写作要点：1. 阐述终身学习的重要性；2. 举例说明；3. 总结观点。"
        }
      ]
    },
    {
      id: "translation",
      title: "翻译",
      description: "将以下中文段落翻译成英文",
      questions: [
        {
          id: 11,
          type: "translation",
          question: "中国的高铁网络是世界上最大的高铁网络。它不仅大大缩短了城市之间的旅行时间，还促进了经济发展和地区间的互联互通。高铁技术的发展展示了中国在基础设施建设方面的成就。",
          explanation: "翻译要点：注意专业术语的准确翻译，如'高铁'译为'high-speed railway'，'互联互通'译为'interconnectivity'。"
        }
      ]
    }
  ]
};

// 第二套试卷：2025年6月卷2
const paper2: ExamPaper = {
  id: "cet6_2025_06_2",
  title: "2025年6月六级真题（第二套）",
  date: "2025-06",
  description: "2025年6月全国大学英语六级考试真题第二套",
  passages: [
    {
      id: "p4",
      title: "Passage One",
      content: `The concept of sustainable development has gained significant traction in recent decades. It represents a approach to economic growth that meets the needs of the present without compromising the ability of future generations to meet their own needs. This idea has become central to global policy discussions.

At its core, sustainable development recognizes that economic prosperity, environmental protection, and social well-being are interconnected. Traditional economic models often prioritized growth at the expense of the environment, leading to pollution, resource depletion, and climate change. Sustainable development seeks to balance these competing interests.

Businesses worldwide are increasingly adopting sustainable practices. From reducing carbon emissions to implementing circular economy principles, companies are finding that sustainability can be both environmentally responsible and economically beneficial. Consumers are also driving this change by demanding more sustainable products and services.`
    },
    {
      id: "p5",
      title: "Passage Two",
      content: `The digital divide refers to the gap between those who have access to modern information and communication technology and those who do not. This divide exists between developed and developing countries, as well as within countries between different socioeconomic groups.

Access to technology has become essential for participation in modern society. Education, employment, healthcare, and government services increasingly rely on digital platforms. Those without access to technology face significant disadvantages in these areas, perpetuating cycles of inequality.

Addressing the digital divide requires a multi-faceted approach. Infrastructure development, affordable access, digital literacy programs, and relevant content creation all play important roles. Governments, private sector organizations, and civil society must work together to ensure that the benefits of technology are accessible to all.`
    }
  ],
  sections: [
    {
      id: "reading",
      title: "阅读理解",
      description: "仔细阅读以下短文，选择最佳答案",
      questions: [
        {
          id: 1,
          type: "reading",
          passageId: "p4",
          question: "What does sustainable development aim to achieve?",
          options: [
            "A. Maximum economic growth",
            "B. Meeting present needs without compromising future generations",
            "C. Prioritizing environmental protection over economy",
            "D. Returning to traditional economic models"
          ],
          answer: 1,
          explanation: "文章第一段明确指出可持续发展是 'a approach to economic growth that meets the needs of the present without compromising the ability of future generations to meet their own needs'。"
        },
        {
          id: 2,
          type: "reading",
          passageId: "p4",
          question: "According to the passage, what drives businesses to adopt sustainable practices?",
          options: [
            "A. Government regulations only",
            "B. Consumer demand for sustainable products",
            "C. International pressure",
            "D. Lack of other options"
          ],
          answer: 1,
          explanation: "文章最后提到 'Consumers are also driving this change by demanding more sustainable products and services'，说明消费者对可持续产品的需求推动了企业采用可持续实践。"
        },
        {
          id: 3,
          type: "reading",
          passageId: "p5",
          question: "What is the digital divide?",
          options: [
            "A. The difference in computer prices",
            "B. The gap in access to modern technology",
            "C. The speed of internet connections",
            "D. The number of smartphone users"
          ],
          answer: 1,
          explanation: "文章第一段定义数字鸿沟为 'the gap between those who have access to modern information and communication technology and those who do not'。"
        },
        {
          id: 4,
          type: "reading",
          passageId: "p5",
          question: "What approach is needed to address the digital divide?",
          options: [
            "A. Only government intervention",
            "B. A multi-faceted approach involving various stakeholders",
            "C. Simply providing free devices",
            "D. Ignoring the problem"
          ],
          answer: 1,
          explanation: "文章最后指出 'Addressing the digital divide requires a multi-faceted approach'，并提到需要多方合作。"
        }
      ]
    },
    {
      id: "vocabulary",
      title: "选词填空",
      description: "从所给选项中选择最合适的词填入空白处",
      questions: [
        {
          id: 5,
          type: "reading",
          question: "The government has _______ new policies to promote renewable energy.",
          options: ["A. implemented", "B. abandoned", "C. delayed", "D. ignored"],
          answer: 0,
          explanation: "implement 意为'实施'，符合语境。"
        },
        {
          id: 6,
          type: "reading",
          question: "The project requires _______ collaboration between multiple departments.",
          options: ["A. minimal", "B. extensive", "C. optional", "D. temporary"],
          answer: 1,
          explanation: "extensive 意为'广泛的'，符合语境。"
        }
      ]
    },
    {
      id: "writing",
      title: "写作",
      description: "根据要求完成写作任务",
      questions: [
        {
          id: 7,
          type: "writing",
          question: "Directions: For this part, you are allowed 30 minutes to write an essay on the impact of social media on interpersonal relationships. You should write at least 150 words but no more than 200 words.",
          explanation: "写作要点：1. 社交媒体对人际关系的影响；2. 正面和负面影响；3. 个人观点。"
        }
      ]
    },
    {
      id: "translation",
      title: "翻译",
      description: "将以下中文段落翻译成英文",
      questions: [
        {
          id: 8,
          type: "translation",
          question: "中国的移动支付普及率在全球领先。无论是大型商场还是街边小摊，消费者都可以使用手机轻松完成支付。这种便捷的支付方式不仅改变了人们的消费习惯，也推动了数字经济的发展。",
          explanation: "翻译要点：注意'移动支付'译为'mobile payment'，'普及率'译为'penetration rate'，'数字经济'译为'digital economy'。"
        }
      ]
    }
  ]
};

// 第三套试卷：2025年12月卷1
const paper3: ExamPaper = {
  id: "cet6_2025_12_1",
  title: "2025年12月六级真题（第一套）",
  date: "2025-12",
  description: "2025年12月全国大学英语六级考试真题第一套",
  passages: [
    {
      id: "p6",
      title: "Passage One",
      content: `The gig economy has transformed the traditional employment landscape. Workers in the gig economy perform short-term, flexible jobs rather than holding permanent positions. This shift has been facilitated by digital platforms that connect workers with clients seeking specific services.

Proponents of the gig economy highlight its flexibility and autonomy. Workers can choose when, where, and how much they work. This arrangement appeals to many, particularly those seeking work-life balance or supplementary income. For businesses, the gig economy offers access to a diverse talent pool without the overhead of full-time employment.

Critics, however, point to the lack of job security and benefits. Gig workers typically do not receive health insurance, retirement benefits, or paid leave. The unpredictable nature of gig work can lead to financial instability. As the gig economy continues to grow, policymakers face the challenge of protecting workers' rights while preserving the flexibility that makes this type of work attractive.`
    }
  ],
  sections: [
    {
      id: "reading",
      title: "阅读理解",
      description: "仔细阅读以下短文，选择最佳答案",
      questions: [
        {
          id: 1,
          type: "reading",
          passageId: "p6",
          question: "What has facilitated the growth of the gig economy?",
          options: [
            "A. Government policies",
            "B. Digital platforms connecting workers and clients",
            "C. Traditional employers",
            "D. Labor unions"
          ],
          answer: 1,
          explanation: "文章指出 'This shift has been facilitated by digital platforms that connect workers with clients seeking specific services'，说明数字平台促进了零工经济的发展。"
        },
        {
          id: 2,
          type: "reading",
          passageId: "p6",
          question: "What is a major concern about gig work mentioned by critics?",
          options: [
            "A. Too much supervision",
            "B. Lack of job security and benefits",
            "C. Excessive regulations",
            "D. High competition"
          ],
          answer: 1,
          explanation: "文章提到批评者指出 'the lack of job security and benefits'，说明缺乏工作保障和福利是主要担忧。"
        }
      ]
    },
    {
      id: "writing",
      title: "写作",
      description: "根据要求完成写作任务",
      questions: [
        {
          id: 3,
          type: "writing",
          question: "Directions: For this part, you are allowed 30 minutes to write an essay on the advantages and disadvantages of online education. You should write at least 150 words but no more than 200 words.",
          explanation: "写作要点：1. 在线教育的优势；2. 在线教育的劣势；3. 个人观点。"
        }
      ]
    },
    {
      id: "translation",
      title: "翻译",
      description: "将以下中文段落翻译成英文",
      questions: [
        {
          id: 4,
          type: "translation",
          question: "中国的电子商务发展迅速，已经成为全球最大的在线零售市场。直播带货作为一种新兴的销售模式，吸引了大量消费者。这种模式通过实时互动，让消费者能够更直观地了解商品，提高了购物体验。",
          explanation: "翻译要点：注意'电子商务'译为'e-commerce'，'直播带货'译为'live-streaming e-commerce'，'零售市场'译为'retail market'。"
        }
      ]
    }
  ]
};

// 所有试卷数据
export const examPapers: ExamPaper[] = [paper1, paper2, paper3];

// 获取试卷列表（不包含详细数据，用于选择页面）
export function getExamPaperList() {
  return examPapers.map(({ id, title, date, description }) => ({
    id,
    title,
    date,
    description
  }));
}

// 根据ID获取试卷
export function getExamPaperById(id: string): ExamPaper | undefined {
  return examPapers.find(paper => paper.id === id);
}

// 获取试卷中的 passage
export function getPassage(paper: ExamPaper, passageId: string): Passage | undefined {
  return paper.passages.find(p => p.id === passageId);
}

// 获取总题数
export function getTotalQuestions(paper: ExamPaper): number {
  return paper.sections.reduce((total, section) => total + section.questions.length, 0);
}
