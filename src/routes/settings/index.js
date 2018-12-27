import { h, Component } from 'preact';
import { DB } from '../../utils/db';
import { slugify } from '../../utils/slugify';

export default class Questions extends Component {
  state = {
    db: null,
    questions: []
  };

  async componentDidMount() {
    const db = new DB();

    db.keys('questions').then(keys => {
      Promise.all(keys.map(x => db.get('questions', x))).then(questions => {
        this.setState({ db, questions });
      });
    });
  }

  updateQuestion = (slug, value) => {
    const questions = [...this.state.questions];
    const question = questions.find(x => x.slug === slug);
    if (!question) {
      return;
    }

    const { key } = this.state;
    question.text = value;
    this.state.db.set('questions', slug, question);

    this.setState({ questions });
  };

  addQuestion = event => {
    event.preventDefault();
    const text = event.target.question.value;
    const slug = slugify(text);
    const question = { slug, text, status: 'live', createdAt: Date.now() };

    this.state.db.set('questions', slug, question).then(x => {
      localStorage.setItem('journalbook_onboarded', true);
      const questions = [...this.state.questions];
      questions.push(question);
      this.setState({ questions });
      event.target.reset();
    });
  };

  render(props, { questions }) {
    return (
      <div class="wrap">
        <h1 class="center h1">Your Questions</h1>

        {questions.map(question => (
          <p>
            <input
              type="text"
              value={question.text}
              onInput={event =>
                this.updateQuestion(question.slug, event.target.value)
              }
            />
          </p>
        ))}

        <form onSubmit={this.addQuestion} class="add-question">
          <div>
            <label for="add-question">Add a question</label>
            <input
              id="add-question"
              type="text"
              name="question"
              required
              placeholder="e.g. What are you grateful for?"
            />
          </div>
          <button type="submit">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg">
              <title>Add Question</title>
              <path
                d="M13.13 6.13H7.87V.88C7.88.34 7.54 0 7 0s-.88.35-.88.88v5.25H.88C.35 6.13 0 6.46 0 7s.35.88.88.88h5.25v5.25c0 .52.34.87.87.87s.88-.35.88-.88V7.88h5.25c.52 0 .87-.35.87-.88s-.35-.88-.88-.88z"
                fill="#4951A3"
                fill-rule="nonzero"
              />
            </svg>
          </button>
        </form>
      </div>
    );
  }
}
